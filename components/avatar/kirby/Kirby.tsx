'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from 'react'
import { loadAvatarRuntime, type RuntimeAvatar } from './avatar-runtime'
import { avatarData, type AnimationName } from './kirby.avatar'

export type { AnimationName } from './kirby.avatar'
export type AvatarHandle = {
  play: (animation?: AnimationName) => void
  pause: () => void
  stop: () => void
  /** Turn the head and eyes towards a point: x/y in -1..1 (right/down positive). */
  lookAt: (x: number, y: number) => void
}
export type AvatarProps = {
  animation?: AnimationName
  playing?: boolean
  loop?: boolean
  size?: number | string
  className?: string
  style?: CSSProperties
  onAnimationEnd?: (animation: AnimationName) => void
}

export const Kirby = forwardRef<AvatarHandle, AvatarProps>(function Kirby(
  {
    animation = "sleeping",
    playing = true,
    loop,
    size = 240,
    className,
    style,
    onAnimationEnd,
  },
  ref
) {
  const host = useRef<HTMLSpanElement>(null)
  const controller = useRef<RuntimeAvatar<AnimationName> | null>(null)
  const animationRef = useRef(animation)
  const playingRef = useRef(playing)
  const onAnimationEndRef = useRef(onAnimationEnd)
  // Keep the latest props available to the async runtime loader without re-mounting it.
  useEffect(() => {
    animationRef.current = animation
    playingRef.current = playing
    onAnimationEndRef.current = onAnimationEnd
  })

  useEffect(() => {
    if (!host.current) return
    let disposed = false
    let avatar: RuntimeAvatar<AnimationName> | null = null
    void loadAvatarRuntime<AnimationName>(avatarData).then(runtime => {
      if (disposed || !host.current) return
      avatar = runtime.createAvatar(host.current, {
        animation: animationRef.current,
        autoplay: playingRef.current,
        loop,
        size: '100%',
        onAnimationEnd: next => onAnimationEndRef.current?.(next),
      })
      controller.current = avatar
    })
    return () => {
      disposed = true
      avatar?.destroy()
      controller.current = null
    }
  }, [loop])

  useEffect(() => {
    const avatar = controller.current
    if (!avatar) return
    if (playing) avatar.play(animation)
    else avatar.pause()
  }, [animation, playing])

  useImperativeHandle(ref, () => ({
    play(next = animation) { controller.current?.play(next) },
    pause() { controller.current?.pause() },
    stop() { controller.current?.stop() },
    lookAt(x, y) { controller.current?.setGaze(x, y) },
  }), [animation])

  const dimension = typeof size === 'number' ? size + 'px' : size
  return <span ref={host} className={className} style={{ display: 'inline-block', width: dimension, height: dimension, ...style }} />
})

export default Kirby
