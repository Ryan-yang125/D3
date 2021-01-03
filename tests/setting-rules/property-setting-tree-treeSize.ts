/*
 * @Author: your name
 * @Date: 2021-01-03 22:43:14
 * @LastEditTime: 2021-01-03 23:10:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /code/tests/setting-rules/property-setting-tree-treeSize.ts
 */
export default {
  treeSizeWidth: {
    type: 'number',
    title: '树宽',
    default: 25,
    values: [1, 200],
  },
  treeSizeHeight: {
    type: 'number',
    title: '树高',
    default: 300,
    values: [200, 500],
  },
};
