import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../Loader';
import AddressTypeahead from './address-typeahead';

const formatName = n => `${n.properties.city || n.properties.name}, ${n.properties.country} (${n.properties.osm_value})`;

class SearchForm extends React.PureComponent {
  state = {
    isSubmitting: false,
    selectedPoint: [],
    bboxSide: 20,
  };

  examples = {
    cluj: {
      value: {
        geometry: { coordinates: [23.5900604, 46.7693367], type: 'Point' },
        type: 'Feature',
        properties: {
          osm_id: 32591050, osm_type: 'N', country: 'Romania', osm_key: 'place', city: 'Cluj-Napoca', osm_value: 'city', postcode: '400133', name: 'Cluj-Napoca', state: 'Cluj',
        },
      },
      bboxSide: 30,
    },
    sebes: {
      value: {
        geometry: { coordinates: [23.56496217814282, 45.955398], type: 'Point' },
        type: 'Feature',
        properties: {
          osm_id: 75247486, osm_type: 'W', extent: [23.5333448, 45.9768038, 23.593344, 45.934104], country: 'Romania', osm_key: 'place', osm_value: 'town', name: 'Sebeș', state: 'Alba',
        },
      },
      bboxSide: 50,
    },
  };

  constructor(props) {
    super(props);
    this.doSubmit = this.doSubmit.bind(this);
    this.handleBboxSideChange = this.handleBboxSideChange.bind(this);
    this.setExample = this.setExample.bind(this);
  }

  setExample(ex) {
    if (this.examples[ex]) {
      const { onSubmit } = this.props;
      this.setState({
        bboxSide: this.examples[ex].bboxSide,
        selectedPoint: [this.examples[ex].value],
      });
      onSubmit(
        formatName(this.examples[ex].value),
        this.examples[ex].value.geometry.coordinates,
        this.examples[ex].bboxSide,
      );
    }
  }

  doSubmit(e) {
    e.preventDefault();
    this.setState({
      isSubmitting: true,
    });
    const { onSubmit } = this.props;
    const { selectedPoint, bboxSide } = this.state;

    onSubmit(
      formatName(selectedPoint[0]),
      selectedPoint[0].geometry.coordinates,
      bboxSide,
    ).then(() => {
      this.setState({
        isSubmitting: false,
      });
    });
  }

  handleBboxSideChange(e) {
    this.setState({
      bboxSide: e.target.value,
    });
  }

  render() {
    const {
      isSubmitting, bboxSide, selectedPoint,
    } = this.state;
    const examples = Object.keys(this.examples).map(ex => (
      <button
        type="button"
        key={ex}
        className="btn btn-dark btn-sm col-sm-12 col-md-auto mr-1 mb-1"
        onClick={() => this.setExample(ex)}
      >
        {`${this.examples[ex].bboxSide} KM around ${formatName(this.examples[ex].value)}`}
      </button>
    ));

    return (
      <form className="mb-1" onSubmit={this.doSubmit}>
        <div className="form-row">
          <div className="col-md-6">
            <label htmlFor="centerpoint">Hotels near</label>
            <AddressTypeahead
              onChange={(val) => {
                if (val.length && val[0].geometry && val[0].geometry.coordinates) {
                  this.setState({
                    selectedPoint: val,
                  });
                }
              }}
              defaultSelected={selectedPoint}
              inputProps={{ name: 'centerpoint', id: 'centerpoint', disabled: isSubmitting }}
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="bboxSide">Search box side size (KM)</label>
            <input
              disabled={isSubmitting}
              type="number"
              min="5"
              max="200"
              className="form-control"
              name="bboxSide"
              id="bboxSide"
              value={bboxSide}
              onChange={this.handleBboxSideChange}
              placeholder="20"
            />
          </div>
          <div className="col-md-3">
            <button
              style={{ marginTop: '32px' }}
              type="submit"
              className="btn btn-primary form-control"
              disabled={!bboxSide || !(selectedPoint.length)}
            >
              {isSubmitting ? <Loader /> : <span>Search</span>}
            </button>
          </div>
        </div>
        <div className="mt-1">
          <strong className="mr-1">Examples:</strong>
          {examples}
        </div>
      </form>
    );
  }
}

SearchForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default SearchForm;
