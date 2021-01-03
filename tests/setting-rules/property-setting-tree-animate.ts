/*
 * @Author: your name
 * @Date: 2021-01-03 20:36:22
 * @LastEditTime: 2021-01-03 20:42:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /code/tests/setting-rules/property-setting-tree-animateControl.ts
 */
export default {
  animateDuration: {
    type: 'number',
    title: '更新动画速度',
    default: 750,
    values: [250, 1500],
  },
  animateExpandAll: {
    type: 'boolean',
    title: '打开所有节点',
    default: false,
  },
};
