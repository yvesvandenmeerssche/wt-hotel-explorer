import React from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import {
  Formik, Form, Field, FieldArray,
} from 'formik';

const GuestAgeForm = ({
  push, remove, form,
}) => (
  <React.Fragment>
    <h5 className="mb-1">Guests information</h5>
    <div className="row">

      <div className="col-12">
        <p className="mb-1">
          Enter the age of each guest
        </p>
      </div>

      {form.values.guests && form.values.guests.map((guest, index) => (
        /* eslint-disable-next-line react/no-array-index-key */
        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={`guests.wrapper.${index}`}>
          <label htmlFor={`guests.${index}.age`} className="sr-only">
            Age of guest #
            {index + 1}
          </label>
          {/* eslint-disable-next-line react/no-array-index-key */}
          <div key={`guests.${index}`} className="mb-1">
            <div className="input-group">
              <Field
                placeholder={`Age of guest #${index + 1}`}
                aria-label={`Age of guest #${index + 1}`}
                type="number"
                className={`form-control ${index !== 0 && 'border-right-0'}`}
                name={`guests.${index}.age`}
                id={`guests.${index}.age`}
                min="0"
              />
              {index !== 0
                && (
                <span className="input-group-append">
                  <button
                    type="button"
                    className="input-group-text input-group-text--btn border-left-0 bg-white text-muted"
                    title="Remove guest"
                    onClick={() => remove(index)}
                  >
                    <i className="mdi mdi-close-circle" />
                  </button>
                </span>
                )}
            </div>
          </div>
        </div>
      ))}
    </div>
    <button
      type="button"
      className="btn btn-outline-dark btn-sm"
      onClick={() => push({ age: 0 })}
    >
        Add a guest
    </button>
  </React.Fragment>
);

GuestAgeForm.propTypes = {
  push: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  form: PropTypes.instanceOf(Object).isRequired,
};

const GuestForm = ({ handleSubmit, initialValues }) => {
  const validate = (values) => {
    const errors = {};
    // formats
    if (!values.guests || values.guests.length < 1) {
      errors.guests = 'We need information about at least one guest!';
    }
    if (values.guests.filter(x => Number.isInteger(x.age)).length < 1) {
      errors.guests = 'We need information about at least one guest!';
    }
    const normalizedArrival = dayjs(values.arrival);
    const normalizedDeparture = dayjs(values.departure);
    if (!normalizedArrival.isValid()) {
      errors.arrival = 'Invalid arrival date!';
    }
    if (!normalizedArrival.isAfter(dayjs())) {
      errors.arrival = 'Arrival date has to be in the future!';
    }
    if (!normalizedDeparture.isValid()) {
      errors.departure = 'Invalid departure date!';
    }
    // arrival has to be before departure
    if (normalizedArrival.isValid()
        && normalizedDeparture.isValid()
        && normalizedArrival.isAfter(normalizedDeparture)) {
      errors.arrival = 'Arrival has to be before departure!';
    }
    return errors;
  };

  const doSubmit = (values, formActions) => {
    handleSubmit({
      guests: values.guests.map(x => Object.assign(x, { age: parseInt(x.age, 10) })),
      arrival: dayjs(values.arrival).format('YYYY-MM-DD'),
      departure: dayjs(values.departure).format('YYYY-MM-DD'),
      _formActions: {
        setSubmitting: formActions.setSubmitting,
        setErrors: formActions.setErrors,
      },
    });
  };
  return (
    <div className="collapse" id="form-estimates">
      <h2 className="my-1 h3">Get an estimate</h2>
      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={doSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="border border-light bg-light p-2 mb-2">
            <div className="form-row mb-1">
              <div className="form-group col-md-6">
                <label htmlFor="arrival">Date of arrival</label>
                <Field type="text" className="form-control" name="arrival" id="arrival" placeholder="Date of arrival" />
                {errors.arrival && touched.arrival && <small className="text-danger">{errors.arrival}</small>}

              </div>
              <div className="form-group col-md-6">
                <label htmlFor="departure">Date of departure</label>
                <Field type="text" className="form-control" name="departure" id="departure" placeholder="Date of departure" />
                {errors.departure && touched.departure && <small className="text-danger">{errors.departure}</small>}
              </div>
            </div>
            <div className="form-row mb-1">
              <div className="form-group col-12">
                <FieldArray
                  name="guests"
                  component={GuestAgeForm}
                />
                {errors.guests && touched.guests
                  && (
                  <small className="text-danger ml-1">
                    {errors.guests}
                  </small>
                  )
                }
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary">Get estimates!</button>

          </Form>
        )}
      </Formik>
    </div>
  );
};

const baseDate = dayjs().day() <= 3 ? dayjs() : dayjs().set('day', 0).add(7, 'days');
const defaultArrival = dayjs(baseDate).set('day', 5).startOf('day').format('YYYY-MM-DD');
const defaultDeparture = dayjs(baseDate).set('day', 7).startOf('day').format('YYYY-MM-DD');

GuestForm.defaultProps = {
  initialValues: {
    arrival: defaultArrival,
    departure: defaultDeparture,
    guests: [],
  },
};

GuestForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.instanceOf(Object),
};

export default GuestForm;
