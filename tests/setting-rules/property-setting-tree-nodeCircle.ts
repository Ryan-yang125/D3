/*
 * @Author: your name
 * @Date: 2021-01-03 19:39:17
 * @LastEditTime: 2021-01-03 19:59:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /code/tests/setting-rules/property-setting-tree-nodeCircle.ts
 */
export default {
  nodeCircleSize: {
    type: 'number',
    title: '节点大小',
    default: 5,
    values: [2, 12],
  },
  nodeCircleBorderWidth: {
    type: 'number',
    title: '节点边框宽度',
    default: 2,
    values: [1, 4],
  },
  nodeCircleBorderColor: {
    type: 'color',
    title: '节点边框颜色',
    default: '#B83A3A',
  },
  nodeCircleOpenFill: {
    type: 'color',
    title: '展开节点颜色',
    default: '#fff',
  },
  nodeCircleCloseFill: {
    type: 'color',
    title: '关闭节点颜色',
    default: '#999',
  },
};
