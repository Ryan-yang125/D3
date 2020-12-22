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
      title: null,
      titleText: 'Tree',
      titleRectWidth: 460,
      titleRectHeight: 40,
      width: 460,
      height: 460,
      chartPadding: { top: 80, right: 80, bottom: 80, left: 80 },
      data: [],
    };
  },
  // https://cn.vuejs.org/v2/api/#mounted
  mounted() {
    // 这里会在实例被挂载后调用
    // 初始化图表
    this.initTree();
  },
  // https://cn.vuejs.org/v2/api/#computed
  // https://cn.vuejs.org/v2/guide/computed.html#%E5%9F%BA%E7%A1%80%E4%BE%8B%E5%AD%90
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
  // https://cn.vuejs.org/v2/api/#watch
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
    // 请根据组件需要补充...
  },
  // https://cn.vuejs.org/v2/api/#methods
  methods: {
    initTree() {
      console.log(this.options);
      // 读入data
      const data = {
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
      };
      this.treeRoot = d3h.hierarchy(data);
      // this.treeRoot = d3h.hierarchy(originData);
      // 指定图表的宽高
      this.width = 700 - this.chartPadding.right - this.chartPadding.left - 180;
      this.height = 700 - this.chartPadding.bottom - this.chartPadding.top - 80;

      // 选择svg容器
      d3.select('#tree-container')
        .style('width', '720px')
        .style('height', '720px');

      // 添加svg
      this.svg = d3
        .select('#tree-container')
        .append('svg')
        .attr('style', 'background: white')
        .attr('width', 700)
        .attr('height', 700);
      // 添加g标签
      this.g = this.svg
        .append('g')
        .attr('class', 'chart') // 图表部分
        .attr(
          'transform',
          `translate(${this.chartPadding.left + 40}, ${this.chartPadding.top +
            40})`
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
