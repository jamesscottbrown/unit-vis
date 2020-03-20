import {Spec} from '../../index.d';
const spec: Spec = {
  title: 'Titanic',
  data: {
    url: 'data/titanic3.csv',
  },
  width: 320,
  height: 240,
  padding: {
    top: 5,
    left: 5,
    bottom: 5,
    right: 5,
  },
  layouts: [
    {
      name: 'layout1',
      type: 'gridxy',
      subgroup: {
        type: 'groupby',
        key: 'pclass',
        isShared: false,
      },
      aspect_ratio: 'fillX',
      size: {
        type: 'uniform',
        isShared: false,
      },
      direction: 'LRBT',
      align: 'LB',
      margin: {
        top: 5,
        left: 5,
        bottom: 5,
        right: 5,
      },
      padding: {
        top: 5,
        left: 5,
        bottom: 5,
        right: 5,
      },
      box: {
        fill: 'blue',
        stroke: 'black',
        'stroke-width': 1,
        opacity: 0.3,
      },
    },
    {
      name: 'layout2',
      type: 'gridxy',
      subgroup: {
        type: 'flatten',
      },
      aspect_ratio: 'fillY',
      size: {
        type: 'sum',
        key: 'fare',
        isShared: true,
      },
      direction: 'LRTB',
      align: 'LB',
      margin: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      },
      padding: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      },
      box: {
        fill: 'green',
        stroke: 'green',
        'stroke-width': 0,
        opacity: 0.5,
      },
      sort: {
        key: 'fare',
        type: 'numerical',
      },
    },
  ],
  mark: {
    shape: 'circle',
    color: {
      key: 'survived',
      type: 'categorical',
    },
    size: {
      type: 'max',
      isShared: false,
    },
    isColorScaleShared: true,
  },
  $schema: 'https://unit-vis.netlify.com/assets/unit-vis-schema.json',
};
export default spec;
