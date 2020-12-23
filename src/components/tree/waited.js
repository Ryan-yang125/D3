/*
 * @Author: your name
 * @Date: 2020-12-23 09:19:49
 * @LastEditTime: 2020-12-23 09:19:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /code/src/components/tree/waited.js
 */
(() => {
  this.treeRoot = d3h.hierarchy(this.data);
  // 添加g标签
  this.g = this.svg
    .append('g')
    .attr('class', 'chart') // 图表部分
    .attr(
      'transform',
      `translate(${this.chartPadding.left + 40}, ${this.chartPadding.top + 40})`
    );
  // 初始化树
  this.treeLayout = d3h.tree();
  this.treeLayout.size([400, 400]);
  this.treeLayout(this.treeRoot);
  // 	添加树节点groups
  this.treeNodes = this.g
    .append('g')
    .attr('class', 'nodes')
    .selectAll('node')
    .data(this.treeRoot.descendants())
    .enter()
    .append('g')
    .classed('node', true)
    .attr('transform', (d) => `translate(${d.y},${d.x})`);
  // 	绘制节点
  this.treeNodes
    .append('circle')
    .classed('solid-node', true)
    .attr('fill', (d) => (d.children ? '#555' : '#999'))
    .attr('r', 2.5);
  //	添加节点信息
  this.treeNodes
    .append('text')
    .attr('dy', '0.31em')
    .attr('x', (d) => (d.children ? -6 : 6))
    .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
    .text((d) => d.data.name)
    .clone(true)
    .lower()
    .attr('stroke', 'white');
  // 添加links
  this.treeLinks = this.g
    .append('g')
    .attr('fill', 'none')
    .attr('stroke', '#555')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5)
    .selectAll('path')
    .data(this.treeRoot.links())
    .join('path')
    .attr(
      'd',
      d3
        .linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x)
    );
})();
