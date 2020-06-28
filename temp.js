function SimpleButton(props) {
  const rowData = props.cell._cell.row.data;
  const cellValue = props.cell._cell.value || "Edit | Show";
  return <button onClick={() => alert(rowData.name)}>{cellValue}</button>;
}


const editableColumns = [
  {
    title: "Name",
    field: "name",
    width: 150,
    editor: "input",
    headerFilter: "input"
  },
  {
    title: "Age",
    field: "age",
    align: "left",
    formatter: "progress",
    editor: "progress"
  },
  {
    title: "Favourite Color",
    field: "color",
    editor: "select",
    editorParams: {
      allowEmpty: true,
      showListOnEmpty: true,
      values: colorOptions
    },
    headerFilter: "select",
    headerFilterParams: { values: colorOptions }
  },
  {
    title: "Date Of Birth",
    field: "dob",
    sorter: "date",
    editor: DateEditor,
    editorParams: { format: "MM/DD/YYYY" }
  },
  {
    title: "Pets",
    field: "pets",
    editor: MultiSelectEditor,
    editorParams: { values: petOptions },
    formatter: MultiValueFormatter,
    formatterParams: { style: "PILL" }
  },
  {
    title: "Passed?",
    field: "passed",
    align: "center",
    formatter: "tickCross",
    editor: true
  }
];

class Home extends React.Component {
  state = {
    data: [],
    selectedName: ""
  };
  ref = null;

  columns = [
    { title: "Name", field: "name", width: 150 },
    { title: "Age", field: "age", align: "left", formatter: "progress" },
    { title: "Favourite Color", field: "color" },
    { title: "Date Of Birth", field: "dob" },
    { title: "Rating", field: "rating", align: "center", formatter: "star" },
    {
      title: "Passed?",
      field: "passed",
      align: "center",
      formatter: "tickCross"
    },
    {
      title: "Custom",
      field: "custom",
      align: "center",
      editor: "input",
      formatter: reactFormatter(
        <SimpleButton
          onSelect={name => {
            this.setState({ selectedName: name });
            alert(name);
          }}
        />
      )
    }
  ];

  rowClick = (e, row) => {
    console.log("ref table: ", this.ref.table); // this is the Tabulator table instance
    console.log("rowClick id: ${row.getData().id}", row, e);
    this.setState({ selectedName: row.getData().name });
  };

  setData = () => {
    this.setState({ data });
  };

  clearData = () => {
    this.setState({ data: [] });
  };

  render() {
    const options = {
      height: 150,
      movableRows: true
    };
    return (
      <div>
        <React15Tabulator
          ref={ref => (this.ref = ref)}
          columns={this.columns}
          data={data}
          rowClick={this.rowClick}
          options={options}
          data-custom-attr="test-custom-attribute"
          className="custom-css-class"
        />
        <div>Selected Name: {this.state.selectedName}</div>

        <h3>
          Asynchronous data: (e.g. fetch) -{" "}
          <button onClick={this.setData}>Set Data</button>
          <button onClick={this.clearData}>Clear</button>
        </h3>
        <React15Tabulator columns={this.columns} data={this.state.data} />

        <h3>Editable Table</h3>
        <React15Tabulator
          columns={editableColumns}
          data={data}
          footerElement={<span>Footer</span>}
        />
      </div>
    );
  }
}

export default Home;
