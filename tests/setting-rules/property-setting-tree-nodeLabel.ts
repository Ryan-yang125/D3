/*
 * @Author: your name
 * @Date: 2021-01-03 16:20:48
 * @LastEditTime: 2021-01-03 17:28:56
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /code/tests/setting-rules/property-setting-tree-nodeLabel.ts
 */
export default {
  //TODO
  nodeLabelFontSize: {
    type: 'number',
    title: '节点标签大小',
    default: 15,
    values: [10, 30],
  },
  nodeLabelFontFamily: {
    type: 'enum',
    title: '节点标签字体',
    default: 'Arial',
    values: ['Arial', 'Helvetica', 'Verdana', 'Times', 'sans-serif'],
  },
  nodeLabelFontColor: {
    type: 'color',
    title: '节点标签颜色',
    default: '#000',
  },
};
