<template>
  <div id="tree-container" :style="{ width: 600, height: 600 }"></div>
</template>
<script>
import * as d3 from 'd3';
import * as d3h from 'd3-hierarchy';
import originData from '../../assets/tree-data.json';

export default {
  name: 'Tree',
  props: ['options'],
  data() {
    return {
      tree: null,
      g: null,
      chart: null,
      click: null,
      panSpeed: 30,
      duration: 750,
      title: null,
      titleText: 'Tree',
      titleRectWidth: 460,
      titleRectHeight: 40,
      width: 460,
      height: 460,
      chartPadding: { top: 80, right: 80, bottom: 80, left: 80 },
      margin: { top: 10, right: 120, bottom: 10, left: 40 },
      data: {
        name: 'A1',
        children: [
          {
            name: 'B1',
            children: [
              {
                name: 'C1',
                value: 100,
              },
              {
                name: 'C2',
                value: 300,
              },
              {
                name: 'C3',
                value: 200,
              },
            ],
          },
          {
            name: 'B2',
            value: 200,
          },
        ],
      },
    };
  },
  mounted() {
    // 这里会在实例被挂载后调用
    // 初始化图表
    this.initTree();
  },
  computed: {
    // 这里是一些计算属性，当其中涉及的值发生变化时，计算属性会重新计算，返回新的值
    ascendingData() {
      // 升序排序
      return this.sortKeyAscending(this.originData, 'value');
    },
    descendingData() {
      // 降序排序
      return this.sortKeyDescending(this.originData, 'value');
    },
  },
  watch: {
    // watch的作用可以监控一个值的变换，并调用因为变化需要执行的方法。可以通过watch动态改变关联的状态。
    // 这里是一些可被修改的配置项，例如图表标题内容、标题是否显示等
    'options.titleText': {
      handler() {
        this.titleText = this.options.titleText;
        this.title.select('text').text(this.titleText);
      },
    },
    'options.titleIsShow': {
      handler() {
        if (this.options.titleIsShow) {
          this.title.attr('style', 'display: block');
        } else {
          this.title.attr('style', 'display: none');
        }
      },
    },
  },
  methods: {
    initTree() {
      console.log(this.options);
      // 指定图表的宽高
      this.width = 700 - this.chartPadding.right - this.chartPadding.left - 180;
      this.height = 700 - this.chartPadding.bottom - this.chartPadding.top - 80;

      // 选择svg容器
      d3.select('#tree-container')
        .style('width', '960rem')
        .style('height', '960rem');

      // 添加base svg
      this.svg = d3
        .select('#tree-container')
        .append('svg')
        .attr('style', 'background: white')
        .attr('width', '960rem')
        .attr('height', '960rem')
        .call(
          d3.zoom().on('zoom', () => {
            this.svg.attr('transform', d3.event.transform);
          })
        )
        .append('g');

      // 添加links svg
      this.gLink = this.svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke', '#555')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1.5);
      // 添加nodes svg
      this.gNode = this.svg
        .append('g')
        .attr('cursor', 'pointer')
        .attr('pointer-events', 'all');
      // load data
      this.treeRoot = d3h.hierarchy(originData);
      this.treeRoot.x0 = this.height / 2;
      this.treeRoot.y0 = 0;
      this.treeRoot.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        // TODO initial to make some nodes closed
        // if (d.depth && d.data.name.length !== 7) d.children = null;
      });
      // 初始化tree
      this.tree = d3.tree();
      // TODO adjust by the node size
      this.tree.nodeSize([18, this.height]);
      this.tree(this.treeRoot);
      // this.tree = d3.tree(this.treeRoot).nodeSize([10, 25]);
      const linkH = d3
        .linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x);
      /**
       * @description: update tree layout when needed
       * @param {*} source
       * @return {*}
       */

      const update = (source) => {
        const duration = d3.event && d3.event.altKey ? 2500 : 250;
        const nodes = this.treeRoot.descendants().reverse();
        const links = this.treeRoot.links();
        // Compute the new tree layout.
        let left = this.treeRoot;
        let right = this.treeRoot;
        this.treeRoot.eachBefore((node) => {
          if (node.x < left.x) left = node;
          if (node.x > right.x) right = node;
        });
        const height = right.x - left.x + this.margin.top + this.margin.bottom;
        // define transition
        // TODO transition
        const transition = this.svg
          .transition()
          .duration(duration)
          .attr('viewBox', [
            -this.margin.left,
            left.x - this.margin.top,
            this.width,
            height,
          ])
          .tween(
            'resize',
            window.ResizeObserver
              ? null
              : () => () => this.svg.dispatch('toggle')
          );

        // Update the nodes…
        const node = this.gNode.selectAll('g').data(nodes, (d) => d.id);

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node
          .enter()
          .append('g')
          .attr('transform', () => `translate(${source.y0},${source.x0})`)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .on('click', (d) => {
            if (d3.event.defaultPrevented) return; // click suppressed
            d.children = d.children ? null : d._children;
            update(d);
          });

        nodeEnter
          .append('circle')
          .attr('class', 'nodeCircle')
          .attr('r', 2.5)
          .attr('fill', (d) => (d._children ? '#555' : '#999'))
          .attr('stroke-width', 10);

        nodeEnter
          .append('text')
          .attr('x', (d) => (d._children ? -6 : 6))
          .attr('dy', '.31em')
          .attr('class', 'nodeText')
          .attr('text-anchor', (d) => (d._children ? 'end' : 'start'))
          .text((d) => d.data.name)
          .clone(true)
          .lower()
          .attr('stroke-linejoin', 'round')
          .attr('stroke-width', 3)
          .attr('stroke', 'white');

        // Transition nodes to their new position.

        const nodeUpdate = node
          .merge(nodeEnter)
          .transition(transition)
          .attr('transform', (d) => `translate(${d.y},${d.x})`)
          .attr('fill-opacity', 1)
          .attr('stroke-opacity', 1);
        console.log(nodeUpdate);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = node
          .exit()
          .transition(transition)
          .remove()
          .attr('transform', `translate(${source.y},${source.x})`)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0);
        console.log(nodeExit);

        // update the links...
        const link = this.gLink
          .selectAll('path')
          .data(links, (d) => d.target.id);
        // Enter any new links at the parent's previous position.
        const linkEnter = link
          .enter()
          .append('path')
          .attr('d', () => {
            const o = { x: source.x0, y: source.y0 };
            return linkH({ source: o, target: o });
          });

        // Transition links to their new position.
        link
          .merge(linkEnter)
          .transition(transition)
          .attr('d', linkH);

        // Transition exiting nodes to the parent's new position.
        link
          .exit()
          .transition(transition)
          .remove()
          .attr('d', () => {
            const o = { x: source.x, y: source.y };
            return linkH({ source: o, target: o });
          });
        // Stash the old positions for transition.
        nodes.forEach((d) => {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      };
      /**
       * @description: collapse or expand and centered tree when node is clicked
       * @param {*} d
       * @return {*}
       */

      update(this.treeRoot);

      // 添加图表标题
      this.title = this.svg
        .append('g')
        .attr('transform', 'translate(0,0)')
        .attr('style', 'display: none'); // 默认不显示
      // 标题背景框
      this.title
        .append('rect')
        .attr('class', 'title')
        .attr('width', 700)
        .attr('height', `${this.titleRectHeight}`)
        .attr('fill', '#E3E3E3')
        .attr('x', '0')
        .attr('y', '0');
      // 标题文本
      this.title
        .append('text')
        .text(this.titleText)
        .attr('x', 350)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#000');
    },
  },
};
</script>
<style scoped>
text {
  background: '#000';
}
#tree-container {
  overflow: hidden;
}
</style>
