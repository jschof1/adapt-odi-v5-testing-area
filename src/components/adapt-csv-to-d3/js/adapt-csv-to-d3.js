import Adapt from 'core/js/adapt';
import csv2d3 from './csv2d3View';
import ComponentModel from 'core/js/models/componentModel';

export default Adapt.register('csv2d3', {
  model: ComponentModel.extend({}), // create a new class in the inheritance chain so it can be extended per component type if necessary later
  view: csv2d3
});
