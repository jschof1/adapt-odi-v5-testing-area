import ComponentView from 'core/js/views/componentView';
// import d3 from '../lib/d3.min.js';

export default class csv2d3View extends ComponentView {

  events() {
    return {
      'change .js-item-input': 'onInputChanged',
    };
  }

  // function to insert table
  insertTable() {
    // get text input from field and insert into d3.text below
    var text = document.getElementById("csvInput").value;
    // console.log(text);
    // when user clicks button #displayCsv get text input and insert into d3.text below
    this.$('.component__inner').append('<div id="d3"></div>');
    // console.log(d3)
    d3.text("https://gist.githubusercontent.com/heiswayi/9b3b6153b159343ebe9a/raw/d3785fb176e1573fdfd0777fdb8900c2a0e4457b/%2520mh17.csv", function(data) {
    var parsedCSV = d3.csv.parseRows(data);

    var container = d3.select("#d3")
        .append("table")

    .selectAll("tr")
        .data(parsedCSV).enter()
        .append("tr")

    .selectAll("td")
        .data(function(d) {
            return d;
        }).enter()
        .append("td")
        .text(function(d) {
            return d;
        });
});

}

  preRender() {
    this.insertTable();
  }
  postRender() {
    this.setReadyStatus();
    this.setupInviewCompletion();
  }

}
