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
      expandAll: false,
      title: null,
      titleText: 'Tree',
      titleRectWidth: 460,
      titleRectHeight: 40,
      gLinkStroke: { color: '#456', opacity: 0.6, width: 2 },
      nodeLabel: { fontSize: 15, fontFamily: 'Arial', fontColor: '#000' },
      nodeCircle: {
        size: 5,
        borderWidth: 2,
        borderColor: '#B83A3A',
        openFill: '#fff',
        closeFill: '#999',
      },
      treeLayout: { width: 25, height: 300, direction: 'left' },
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
    'options.titlePosition': {
      handler() {
        this.updateTitle();
      },
    },
    'options.titleBackground': {
      handler() {
        if (this.options.titleIsShow) {
          this.title
            .select('rect')
            .attr('fill', `${this.options.titleBackground}`);
        }
      },
    },
    'options.titleFontColor': {
      handler() {
        if (this.options.titleIsShow) {
          this.title
            .select('text')
            .attr('fill', `${this.options.titleFontColor}`);
        }
      },
    },
    'options.titleTextPosition': {
      handler() {
        if (this.options.titleIsShow) {
          // 修改text相对标题rect的位置,来更改文本对齐方式
          switch (this.options.titleTextPosition) {
            case 'center':
              this.title
                .select('text')
                .attr('text-anchor', 'middle')
                .attr('x', 350);
              break;
            case 'left':
              this.title
                .select('text')
                .attr('text-anchor', 'start')
                .attr('x', 10);
              break;
            case 'right':
              this.title
                .select('text')
                .attr('text-anchor', 'end')
                .attr('x', 690);
              break;
            default:
              break;
          }
        }
      },
    },
    'options.titleFontFamily': {
      handler() {
        if (this.options.titleIsShow) {
          this.title
            .select('text')
            .attr('font-family', `${this.options.titleFontFamily}`);
        }
      },
    },
    'options.titleFontSize': {
      handler() {
        if (this.options.titleIsShow) {
          this.title
            .select('text')
            .attr('font-size', `${this.options.titleFontSize}`);
        }
      },
    },
    'options.linkStrokeColor': {
      handler() {
        this.gLinkStroke.color = `${this.options.linkStrokeColor}`;
        this.gLink.attr('stroke', this.gLinkStroke.color);
      },
    },
    'options.linkStrokeOpacity': {
      handler() {
        this.gLinkStroke.opacity = this.options.linkStrokeOpacity / 10;
        this.gLink.attr('stroke-opacity', this.gLinkStroke.opacity);
      },
    },
    'options.linkStrokeWidth': {
      handler() {
        this.gLinkStroke.width = this.options.linkStrokeWidth;
        this.gLink.attr('stroke-width', this.gLinkStroke.width);
      },
    },
    'options.nodeLabelFontSize': {
      handler() {
        this.nodeLabel.fontSize = `${this.options.nodeLabelFontSize}`;
        this.gNode.selectAll('text').attr('font-size', this.nodeLabel.fontSize);
      },
    },
    'options.nodeLabelFontFamily': {
      handler() {
        this.nodeLabel.fontFamily = this.options.nodeLabelFontFamily;
        this.gNode
          .selectAll('text')
          .attr('font-family', this.nodeLabel.fontFamily);
      },
    },
    'options.nodeLabelFontColor': {
      handler() {
        this.nodeLabel.fontColor = `${this.options.nodeLabelFontColor}`;
        this.gNode.selectAll('text').attr('fill', this.nodeLabel.fontColor);
      },
    },
    'options.nodeCircleSize': {
      handler() {
        this.nodeCircle.size = this.options.nodeCircleSize;
        this.gNode.selectAll('circle').attr('r', this.nodeCircle.size);
      },
    },
    'options.nodeCircleBorderWidth': {
      handler() {
        this.nodeCircle.borderWidth = this.options.nodeCircleBorderWidth;
        this.gNode
          .selectAll('circle')
          .attr('stroke-width', this.nodeCircle.borderWidth);
      },
    },
    'options.nodeCircleBorderColor': {
      handler() {
        this.nodeCircle.borderColor = `${this.options.nodeCircleBorderColor}`;
        this.gNode
          .selectAll('circle')
          .attr('stroke', this.nodeCircle.borderColor);
      },
    },
    'options.nodeCircleOpenFill': {
      handler() {
        this.nodeCircle.openFill = `${this.options.nodeCircleOpenFill}`;
        this.gNode
          .selectAll('circle')
          .attr('fill', (d) =>
            d._children
              ? `${this.nodeCircle.openFill}`
              : `${this.nodeCircle.closeFill}`
          );
      },
    },
    'options.nodeCircleCloseFill': {
      handler() {
        this.nodeCircle.closeFill = `${this.options.nodeCircleCloseFill}`;
        this.gNode
          .selectAll('circle')
          .attr('fill', (d) =>
            d._children
              ? `${this.nodeCircle.openFill}`
              : `${this.nodeCircle.closeFill}`
          );
      },
    },
    'options.animateDuration': {
      handler() {
        this.duration = this.options.animateDuration;
      },
    },
    'options.animateExpandAll': {
      handler() {
        this.expandAll = this.options.animateExpandAll;
        if (this.expandAll) {
          this.treeRoot.descendants().forEach((d) => {
            d.children = d._children;
          });
          this.updateTree(this.treeRoot);
        } else {
          this.treeRoot.descendants().forEach((d) => {
            if (d.depth && d.data.name.length !== 7) d.children = null;
          });
          this.updateTree(this.treeRoot);
        }
      },
    },
    'options.treeLayoutWidth': {
      handler() {
        this.treeLayout.width = this.options.treeLayoutWidth;
        this.tree.nodeSize([this.treeLayout.width, this.treeLayout.height]);
        this.updateTree(this.treeRoot);
      },
    },
    'options.treeLayoutHeight': {
      handler() {
        console.log('watched');
        this.treeLayout.height = this.options.treeLayoutHeight;
        this.tree.nodeSize([this.treeLayout.width, this.treeLayout.height]);
        this.updateTree(this.treeRoot);
      },
    },
    'options.treeLayoutDirection': {
      handler() {
        this.treeLayout.direction = this.options.treeLayoutDirection;
        this.updateTree(this.treeRoot);
      },
    },
  },
  methods: {
    initTree() {
      // 选择svg容器
      d3.select('#tree-container')
        .style('width', '100rem')
        .style('height', '100rem');

      // 添加base svg
      this.svg = d3
        .select('#tree-container')
        .append('svg')
        .attr('style', 'background: white')
        .attr('width', '100rem')
        .attr('height', '100rem')
        .call(
          d3.zoom().on('zoom', () => {
            this.svg.attr('transform', d3.event.transform);
          })
        )
        .append('g')
        .attr('transform', `translate(${this.width / 2},${this.height})`);
      // 添加links svg
      this.gLink = this.svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke', this.gLinkStroke.color)
        .attr('stroke-opacity', this.gLinkStroke.opacity)
        .attr('stroke-width', this.gLinkStroke.width);
      // 添加nodes svg
      this.gNode = this.svg
        .append('g')
        .attr('cursor', 'pointer')
        .attr('pointer-events', 'all');
      // load data
      this.treeRoot = d3h.hierarchy(originData);
      this.treeRoot.x0 = this.treeLayout.width / 2;
      this.treeRoot.y0 = 0;
      this.treeRoot.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth && d.data.name.length !== 7) d.children = null;
      });
      // 初始化tree
      this.tree = d3.tree();
      this.tree.nodeSize([this.treeLayout.width, this.treeLayout.height]);
      console.log('init');
      this.tree(this.treeRoot);
      this.updateTree(this.treeRoot);

      // 添加图表标题
      this.title = d3
        .select('#tree-container svg')
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
    /**
     * @description: update tree layout when needed
     * @param {*} source
     * @return {*}
     */

    updateTree(source) {
      console.log('update');
      this.linkDirection();
      this.svg.attr('writing-mode', this.writeMode());

      const nodes = this.treeRoot.descendants().reverse();
      const links = this.treeRoot.links();
      // Compute the new tree layout.
      this.tree(this.treeRoot);
      // transition setting
      const transition = this.svg.transition().duration(this.duration);
      // Update the nodes…
      const node = this.gNode.selectAll('g').data(nodes, (d) => d.id);

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node
        .enter()
        .append('g')
        .attr('transform', this.sourceDirection(source))
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .on('click', (d) => {
          if (d3.event.defaultPrevented) return; // click suppressed
          d.children = d.children ? null : d._children;
          this.updateTree(d);
        });

      nodeEnter
        .append('circle')
        .attr('class', 'nodeCircle')
        .attr('r', this.nodeCircle.size)
        .attr('fill', (d) =>
          d._children
            ? `${this.nodeCircle.openFill}`
            : `${this.nodeCircle.closeFill}`
        )
        .attr('stroke', `${this.nodeCircle.borderColor}`)
        .attr('stroke-width', this.nodeCircle.borderWidth);

      nodeEnter
        .append('text')
        .attr('x', (d) => (d._children ? -6 : 6))
        .attr('dy', '.31em')
        .attr('class', 'nodeText')
        .attr('text-anchor', (d) => (d._children ? 'end' : 'start'))
        .text((d) => d.data.name)
        .attr('font-size', this.nodeLabel.fontSize)
        .attr('font-family', this.nodeLabel.fontFamily)
        .attr('fill', this.nodeLabel.fontColor)
        .clone(true)
        .lower()
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .attr('stroke', 'white');

      // Transition nodes to their new position.

      node
        .merge(nodeEnter)
        .transition(transition)
        .attr('transform', (d) => this.nodeDirection(d))
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1);

      // Transition exiting nodes to the parent's new position.
      node
        .exit()
        .transition(transition)
        .remove()
        .attr('transform', this.sourceDirection(source))
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);

      // update the links...
      const link = this.gLink.selectAll('path').data(links, (d) => d.target.id);
      // Enter any new links at the parent's previous position.
      const linkEnter = link
        .enter()
        .append('path')
        .attr('d', () => {
          const o = { x: source.x0, y: source.y0 };
          return this.linkH({ source: o, target: o });
        });

      // Transition links to their new position.
      link
        .merge(linkEnter)
        .transition(transition)
        .attr('d', this.linkH);

      // Transition exiting nodes to the parent's new position.
      link
        .exit()
        .transition(transition)
        .remove()
        .attr('d', () => {
          const o = { x: source.x, y: source.y };
          return this.linkH({ source: o, target: o });
        });
      // Stash the old positions for transition.
      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    },
    updateTitle() {
      if (this.options.titleIsShow) {
        // 根据设置进行对应旋转和平移
        switch (this.options.titlePosition) {
          case 'top':
            this.title.attr('transform', 'rotate(0) translate(0,0)');
            break;
          case 'bottom':
            this.title.attr('transform', 'rotate(0) translate(0,660)');
            break;
          case 'left':
            this.title.attr('transform', 'translate(0,700) rotate(270)');
            break;
          case 'right':
            this.title.attr('transform', 'translate(700,0) rotate(90)');
            break;
          default:
            break;
        }
      }
    },
    sourceDirection(source) {
      switch (this.treeLayout.direction) {
        case 'left':
          return `translate(${source.y0},${source.x0})`;
        case 'top':
          return `translate(${source.x0},${source.y0})`;
        case 'bottom':
          return `translate(${-source.x0},${-source.y0})`;
        case 'right':
          return `translate(${-source.y0},${-source.x0})`;
        default:
          return `translate(${source.y0},${source.x0})`;
      }
    },
    nodeDirection(d) {
      switch (this.treeLayout.direction) {
        case 'left':
          return `translate(${d.y},${d.x})`;
        case 'top':
          return `translate(${d.x},${d.y})`;
        case 'bottom':
          return `translate(${-d.x},${-d.y})`;
        case 'right':
          return `translate(${-d.y},${-d.x})`;
        default:
          return `translate(${d.y},${d.x})`;
      }
    },
    linkDirection() {
      switch (this.treeLayout.direction) {
        case 'left':
          this.linkH = d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x);
          break;
        case 'top':
          this.linkH = d3
            .linkVertical()
            .x((d) => d.x)
            .y((d) => d.y);
          break;
        case 'right':
          this.linkH = d3
            .linkHorizontal()
            .x((d) => -d.y)
            .y((d) => -d.x);
          break;
        case 'bottom':
          this.linkH = d3
            .linkVertical()
            .x((d) => -d.x)
            .y((d) => -d.y);
          break;
        default:
          this.linkH = d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x);
          break;
      }
    },
    writeMode() {
      switch (this.treeLayout.direction) {
        case 'left':
          return 'horizontal-tb';
        case 'top':
          return 'vertical-lr';
        case 'bottom':
          return 'vertical-lr';
        default:
          return 'horizontal-tb';
      }
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
