import type { TimerStage } from '@/types/screen';

/**
 * Get default timer configuration stages
 * This matches the mock data from Screen.vue
 */
export const getDefaultTimerStages = (): TimerStage[] => {
  return [
    {
      stageName: '开场',
      isDualSide: false,
      hideTimer: true,
      sides: [{ name: '封面页', duration: 180 }],
      bellTimings: [],
    },
    {
      stageName: '开场',
      isDualSide: false,
      hideTimer: true,
      sides: [{ name: '评委介绍', duration: 180 }],
      bellTimings: [],
    },
    {
      stageName: '开场',
      isDualSide: false,
      hideTimer: true,
      sides: [{ name: '双方辩手介绍', duration: 180 }],
      bellTimings: [],
    },
    {
      stageName: '正方一辩立论',
      isDualSide: false,
      hideTimer: false,
      sides: [{ name: '正方一辩', duration: 180 }],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 150, type: 'warning' },
        { time: 180, type: 'end' },
      ],
    },
    {
      stageName: '反方四辩质询正方一辩',
      isDualSide: true,
      hideTimer: false,
      sides: [
        { name: '反方四辩', duration: 90 },
        { name: '正方一辩', duration: 90 },
      ],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 60, type: 'warning' },
        { time: 90, type: 'end' },
      ],
    },
    {
      stageName: '反方一辩立论',
      isDualSide: false,
      hideTimer: false,
      sides: [{ name: '反方一辩', duration: 180 }],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 150, type: 'warning' },
        { time: 180, type: 'end' },
      ],
    },
    {
      stageName: '正方四辩质询反方一辩',
      isDualSide: true,
      hideTimer: false,
      sides: [
        { name: '正方四辩', duration: 90 },
        { name: '反方一辩', duration: 90 },
      ],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 60, type: 'warning' },
        { time: 90, type: 'end' },
      ],
    },
    {
      stageName: '正方二辩驳论',
      isDualSide: false,
      hideTimer: false,
      sides: [{ name: '正方二辩', duration: 120 }],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 90, type: 'warning' },
        { time: 120, type: 'end' },
      ],
    },
    {
      stageName: '反方二辩驳论',
      isDualSide: false,
      hideTimer: false,
      sides: [{ name: '反方二辩', duration: 120 }],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 90, type: 'warning' },
        { time: 120, type: 'end' },
      ],
    },
    {
      stageName: '正反二辩对辩',
      isDualSide: true,
      hideTimer: false,
      sides: [
        { name: '正方二辩', duration: 90 },
        { name: '反方二辩', duration: 90 },
      ],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 60, type: 'warning' },
        { time: 90, type: 'end' },
      ],
    },
    {
      stageName: '正方三辩盘问',
      isDualSide: false,
      hideTimer: false,
      sides: [{ name: '正方三辩', duration: 120 }],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 90, type: 'warning' },
        { time: 120, type: 'end' },
      ],
    },
    {
      stageName: '反方三辩盘问',
      isDualSide: false,
      hideTimer: false,
      sides: [{ name: '反方三辩', duration: 120 }],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 90, type: 'warning' },
        { time: 120, type: 'end' },
      ],
    },
    {
      stageName: '中场暂停',
      isDualSide: false,
      hideTimer: false,
      sides: [{ name: '暂停', duration: 240 }],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 240, type: 'end' },
      ],
    },
    {
      stageName: '正方三辩盘问小结',
      isDualSide: false,
      hideTimer: false,
      sides: [{ name: '正方三辩', duration: 120 }],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 90, type: 'warning' },
        { time: 120, type: 'end' },
      ],
    },
    {
      stageName: '反方三辩盘问小结',
      isDualSide: false,
      hideTimer: false,
      sides: [{ name: '反方三辩', duration: 120 }],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 90, type: 'warning' },
        { time: 120, type: 'end' },
      ],
    },
    {
      stageName: '自由辩论',
      isDualSide: true,
      hideTimer: false,
      sides: [
        { name: '正方', duration: 240 },
        { name: '反方', duration: 240 },
      ],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 210, type: 'warning' },
        { time: 240, type: 'end' },
      ],
    },
    {
      stageName: '反方四辩总结陈词',
      isDualSide: false,
      hideTimer: false,
      sides: [{ name: '反方四辩', duration: 180 }],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 150, type: 'warning' },
        { time: 180, type: 'end' },
      ],
    },
    {
      stageName: '正方四辩总结陈词',
      isDualSide: false,
      hideTimer: false,
      sides: [{ name: '正方四辩', duration: 180 }],
      bellTimings: [
        { time: 0, type: 'start' },
        { time: 150, type: 'warning' },
        { time: 180, type: 'end' },
      ],
    },
    {
      stageName: '',
      isDualSide: false,
      hideTimer: true,
      sides: [{ name: '评委述票', duration: 180 }],
      bellTimings: [],
    },
  ];
};
