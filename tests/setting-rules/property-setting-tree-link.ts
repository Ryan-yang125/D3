/*
 * @Author: your name
 * @Date: 2021-01-03 15:43:39
 * @LastEditTime: 2021-01-03 16:13:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /code/tests/setting-rules/property-setting-tree.ts
 */
export default {
  linkStrokeOpacity: {
    type: 'number',
    title: '路径透明度',
    default: 6,
    values: [0, 10],
  },
  linkStrokeWidth: {
    type: 'number',
    title: '路径宽度',
    default: 2,
    values: [1, 10],
  },
  linkStrokeColor: {
    type: 'color',
    title: '路径颜色',
    default: '#567',
  },
};
