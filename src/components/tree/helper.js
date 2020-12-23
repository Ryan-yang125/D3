/*
 * @Author: Yangrui
 * @Date: 2020-12-22 22:40:17
 * @LastEditTime: 2020-12-23 08:14:04
 * @LastEditors: Please set LastEditors
 * @Description: A zoomable, panable, toggleble tree
 * @FilePath: /code/src/components/tree/helper.js
 */
treeJSON = d3.json('flare-2.json', function(error, treeData) {
  if (error) throw error;
  // Calculate total nodes, max label length
  let totalNodes = 0;
  let maxLabelLength = 0;
  // panning letiables
  let panSpeed = 20;
  // let panBoundary = 20; // Within 20px from edges will pan when dragging.
  // Misc. letiables
  let i = 0;
  let duration = 750;
  let root;

  // size of the diagram
  let viewerWidth = $(document).width();
  let viewerHeight = $(document).height();

  let tree = d3.layout.tree().size([viewerHeight, viewerWidth]);

  // define a d3 diagonal projection for use by the node paths later on.
  const diagonal = d3.svg.diagonal().projection(function(d) {
    return [d.y, d.x];
  });

  // DFS to get totalNodes and maxLabelLength
  //TODO can be moved out
  const visit = (parent) => {
    if (!parent) return;
    totalNodes++;
    maxLabelLength = Math.max(parent.name.length, maxLabelLength);
    let children =
      parent.children && parent.children.length > 0 ? parent.children : null;
    children &&
      children.forEach((node) => {
        visit(node);
      });
  };
  visit(treeData);

  // sort the tree according to the node names
  // incase the json file is unarranged
  //TODO can be moved out
  const sortTree = (tree) => {
    tree.sort((a, b) => {
      return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
    });
  };
  sortTree(tree);
  const pan = (domNode, direction) => {
    let speed = panSpeed;
    //TODO can be Promised()
    if (panTimer) {
      clearTimeout(panTimer);
      let translateCoords = d3.transform(svgGroup.attr('transform'));
      let translateX = null;
      let translateY = null;
      if (direction == 'left' || direction == 'right') {
        translateX =
          direction == 'left'
            ? translateCoords.translate[0] + speed
            : translateCoords.translate[0] - speed;
        translateY = translateCoords.translate[1];
      } else if (direction == 'up' || direction == 'down') {
        translateX = translateCoords.translate[0];
        translateY =
          direction == 'up'
            ? translateCoords.translate[1] + speed
            : translateCoords.translate[1] - speed;
      }
      // let scaleX = translateCoords.scale[0];
      // let scaleY = translateCoords.scale[1];
      let scale = zoomListener.scale();
      svgGroup
        .transition()
        .attr(
          'transform',
          'translate(' + translateX + ',' + translateY + ')scale(' + scale + ')'
        );
      d3.select(domNode)
        .select('g.node')
        .attr('transform', `translate(${translateX},${translateY})`);
      zoomListener.scale(zoomListener.scale());
      zoomListener.translate([translateX, translateY]);
      panTimer = setTimeout(() => {
        pan(domNode, speed, direction);
      }, 100);
    }
  };
  const zoom = () => {
    svgGroup.attr(
      'transform',
      `translate(${d3.event.translate})scale(${d3.event.scale})`
    );
  };

  // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
  let zoomListener = d3.behavior
    .zoom()
    .scaleExtent([0.1, 3])
    .on('zoom', zoom);

  // define the baseSvg, attaching a class for styling and the zoomListener
  let baseSvg = d3
    .select('#tree-container')
    .append('svg')
    .attr('width', viewerWidth)
    .attr('height', viewerHeight)
    .attr('class', 'overlay')
    .call(zoomListener);
  //so node doesn't get lost when collapsing/moving with large amount of children.

  const centerNode = (source) => {
    scale = zoomListener.scale();
    x = -source.y0;
    y = -source.x0;
    x = x * scale + viewerWidth / 2;
    y = y * scale + viewerHeight / 2;
    d3.select('g')
      .transition()
      .duration(duration)
      .attr('transform', 'translate(' + x + ',' + y + ')scale(' + scale + ')');
    zoomListener.scale(scale);
    zoomListener.translate([x, y]);
  };

  // Toggle children function

  const toggleChildren = (d) => {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else if (d._children) {
      d.children = d._children;
      d._children = null;
    }
    return d;
  };

  // Toggle children on click.

  const click = (d) => {
    if (d3.event.defaultPrevented) return; // click suppressed
    d = toggleChildren(d);
    update(d);
    centerNode(d);
  };

  const update = (source) => {
    // Compute the new height,
    // function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed
    // when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    let levelWidth = [1];
    //BFS to get tree level and counts of nodes in each level
    let childCount = (level, n) => {
      if (n.children && n.children.length > 0) {
        if (levelWidth.length <= level + 1) levelWidth.push(0);
        levelWidth[level + 1] += n.children.length;
        n.children.forEach((d) => {
          childCount(level + 1, d);
        });
      }
    };
    childCount(0, root);
    //get new Height of tree by max-counts in a level of the tree
    let newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
    tree = tree.size([newHeight, viewerWidth]);

    // Compute the new tree layout.
    let nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

    // Set widths between levels based on maxLabelLength.
    nodes.forEach((d) => {
      d.y = d.depth * (maxLabelLength * 10); //maxLabelLength * 10px
      // alternatively to keep a fixed scale one can set a fixed depth per level
      // Normalize for fixed-depth by commenting out below line
      // d.y = (d.depth * 500); //500px per level.
    });

    // Update the nodes…
    node = svgGroup.selectAll('g.node').data(nodes, (d) => {
      return d.id || (d.id = ++i);
    });

    // Enter any new nodes at the parent's previous position.
    let nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', `translate(${source.y0},${source.x0})`)
      .on('click', click);

    nodeEnter
      .append('circle')
      .attr('class', 'nodeCircle')
      .attr('r', 0)
      .style('fill', function(d) {
        return d._children ? 'lightsteelblue' : '#fff';
      });

    nodeEnter
      .append('text')
      .attr('x', function(d) {
        return d.children || d._children ? -10 : 10;
      })
      .attr('dy', '.35em')
      .attr('class', 'nodeText')
      .attr('text-anchor', (d) => {
        return d.children || d._children ? 'end' : 'start';
      })
      .text((d) => {
        return d.name;
      })
      .style('fill-opacity', 0);

    // Update the text to reflect whether node has children or not.
    node
      .select('text')
      .attr('x', function(d) {
        return d.children || d._children ? -10 : 10;
      })
      .attr('text-anchor', function(d) {
        return d.children || d._children ? 'end' : 'start';
      })
      .text(function(d) {
        return d.name;
      });

    // Change the circle fill depending on whether it has children and is collapsed
    node
      .select('circle.nodeCircle')
      .attr('r', 4.5)
      .style('fill', function(d) {
        return d._children ? 'lightsteelblue' : '#fff';
      });

    // Transition nodes to their new position.
    let nodeUpdate = node
      .transition()
      .duration(duration)
      .attr('transform', (d) => {
        return `translate(${d.y},${d.x})`;
      });

    // Fade the text in
    nodeUpdate.select('text').style('fill-opacity', 1);

    // Transition exiting nodes to the parent's new position.
    let nodeExit = node
      .exit()
      .transition()
      .duration(duration)
      .attr('transform', (d) => {
        return `translate(${source.y},${source.x})`;
      })
      .remove();

    nodeExit.select('circle').attr('r', 0);

    nodeExit.select('text').style('fill-opacity', 0);

    // Update the links…
    let link = svgGroup.selectAll('path.link').data(links, (d) => {
      return d.target.id;
    });

    // Enter any new links at the parent's previous position.
    link
      .enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('d', () => {
        let o = {
          x: source.x0,
          y: source.y0,
        };
        return diagonal({
          source: o,
          target: o,
        });
      });

    // Transition links to their new position.
    link
      .transition()
      .duration(duration)
      .attr('d', diagonal);

    // Transition exiting nodes to the parent's new position.
    link
      .exit()
      .transition()
      .duration(duration)
      .attr('d', function(d) {
        let o = {
          x: source.x,
          y: source.y,
        };
        return diagonal({
          source: o,
          target: o,
        });
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  };

  // Append a group which holds all nodes and which the zoom Listener can act upon.
  let svgGroup = baseSvg.append('g');

  // Define the root
  root = treeData;
  root.x0 = viewerHeight / 2;
  root.y0 = 0;

  // Layout the tree initially and center on the root node.
  update(root);
  centerNode(root);
});
