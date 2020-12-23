<template>
  <div id="tree-container" :style="{ width: 600, height: 600 }"></div>
</template>
<script>
import * as d3 from 'd3';
import * as d3h from 'd3-hierarchy';
// import originData from '../../assets/tree-data.json';

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
      // this.treeRoot = d3h.hierarchy(originData);
      // 指定图表的宽高
      this.width = 700 - this.chartPadding.right - this.chartPadding.left - 180;
      this.height = 700 - this.chartPadding.bottom - this.chartPadding.top - 80;

      // 选择svg容器
      d3.select('#tree-container')
        .style('width', '960rem')
        .style('height', '960rem');

      // 添加svg
      this.svg = d3
        .select('#tree-container')
        .append('svg')
        .attr('style', 'background: #eee')
        .attr('width', '920rem')
        .attr('height', '920rem');
      this.svg.call(
        d3.zoom().on('zoom', () => {
          this.svg.attr('transform', d3.event.transform);
        })
      );
      // 添加links svg
      this.gLink = this.svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke', '#555')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1.5);
      // 添加nodes svg
      this.svgGroup = this.svg.append('g');
      // 初始化tree
      this.tree = d3h.tree();
      this.tree.size([this.width, this.height]);
      this.index = 0;
      // load json file
      this.treeRoot = d3h.hierarchy(this.data);
      this.treeRoot.x0 = this.height / 2;
      this.treeRoot.y0 = 0;
      this.tree(this.treeRoot);

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
        // Compute the new height,
        // function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed
        // when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        const levelWidth = [1];
        // BFS to get tree level and counts of nodes in each level
        const childCount = (level, n) => {
          if (n.children && n.children.length > 0) {
            if (levelWidth.length <= level + 1) levelWidth.push(0);
            levelWidth[level + 1] += n.children.length;
            n.children.forEach((d) => {
              childCount(level + 1, d);
            });
          }
        };
        childCount(0, this.treeRoot);
        // get new Height of tree by max-counts in a level of the tree
        const newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
        this.tree.size([newHeight, this.width]);

        // Compute the new tree layout.
        const nodes = this.treeRoot.descendants().reverse();
        const links = this.treeRoot.links();

        // Update the nodes…
        this.node = this.svgGroup.selectAll('g.node').data(nodes, (d) => {
          if (!d.id) d.id = ++this.index;
        });
        // console.log(source.x0, source.y0);
        // Enter any new nodes at the parent's previous position.
        this.nodeEnter = this.node
          .enter()
          .append('g')
          .attr('class', 'node')
          .attr('transform', `translate(${source.y0},${source.x0})`)
          .on('click', this.click);
        this.nodeEnter
          .append('circle')
          .attr('class', 'nodeCircle')
          .attr('r', 2.5)
          .style('fill', (d) => (d.children ? '#555' : '#999'));

        this.nodeEnter
          .append('text')
          .attr('x', (d) => (d.children || d._children ? -10 : 10))
          .attr('dy', '.35em')
          .attr('class', 'nodeText')
          .attr('text-anchor', (d) =>
            d.children || d._children ? 'end' : 'start'
          )
          .text((d) => d.data.name)
          .lower()
          .style('fill-opacity', 0);
        // Update the text to reflect whether node has children or not.
        // this.nodeEnter
        //   .select('text')
        //   .attr('x', (d) => (d.children || d._children ? -10 : 10))
        //   .attr('text-anchor', (d) =>
        //     d.children || d._children ? 'end' : 'start'
        //   )
        //   .text((d) => d.name);

        // Change the circle fill depending on whether it has children and is collapsed
        // this.nodeEnter
        //   .select('circle.nodeCircle')
        //   .attr('r', 2.5)
        //   .style('fill', (d) => (d._children ? '#555' : '#999'));

        // Transition nodes to their new position.

        const nodeUpdate = this.nodeEnter
          .transition()
          .duration(this.duration)
          .attr('transform', (d) => `translate(${d.y},${d.x})`);
        console.log(this.nodeEnter);

        // Fade the text in
        nodeUpdate.select('text').style('fill-opacity', 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = this.node
          .exit()
          .transition()
          .duration(this.duration)
          .attr('transform', `translate(${source.y},${source.x})`)
          .remove();

        nodeExit.select('circle').attr('r', 0);

        nodeExit.select('text').style('fill-opacity', 0);

        // Update the links…
        // this.svgGroup
        //   .append('g')
        //   .attr('fill', 'none')
        //   .attr('stroke', '#555')
        //   .attr('stroke-opacity', 0.4)
        //   .attr('stroke-width', 1.5)
        //   .selectAll('path')
        //   .data(links, (d) => d.target.id)
        //   .join('path')
        //   .attr(
        //     'd',
        //     d3
        //       .linkHorizontal()
        //       .x(source.x0)
        //       .y(source.y0)
        //   );

        // Enter any new links at the parent's previous position.
        const link = this.gLink
          .selectAll('path')
          .data(links, (d) => d.target.id);
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
          .transition(this.duration)
          .attr('d', linkH);

        // Transition exiting nodes to the parent's new position.
        link
          .exit()
          .transition(this.duration)
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
      this.click = (d) => {
        if (d3.event.defaultPrevented) return; // click suppressed
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else if (d._children) {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      };

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
