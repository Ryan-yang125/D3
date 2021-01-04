/*
 * @Author: your name
 * @Date: 2021-01-03 22:43:14
 * @LastEditTime: 2021-01-04 19:06:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /code/tests/setting-rules/property-setting-tree-treeSize.ts
 */
export default {
  treeLayoutWidth: {
    type: 'number',
    title: '树宽',
    default: 25,
    values: [1, 200],
  },
  treeLayoutHeight: {
    type: 'number',
    title: '树高',
    default: 300,
    values: [1, 500],
  },
  treeLayoutDirection: {
    type: 'enum',
    title: '树排列方向',
    default: 'left',
    values: ['left', 'right', 'top', 'bottom'],
  },
};
