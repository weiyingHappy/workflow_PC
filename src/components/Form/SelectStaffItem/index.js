import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import SelectStaff from '../../SelectStaff';
import Select from '../../Select';
import { makeFieldValue } from '../../../utils/utils';
import style from './index.less';

@connect()
class SelectStaffItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue, field } = this.props;
    const muti = field.is_checkbox;
    const staffs = defaultValue || (muti ? [] : '');
    this.state = {
      value: staffs,
      errorMsg: '',
    };
  }

  componentWillMount() {}

  componentWillReceiveProps(props) {
    const { value, errorMsg } = props;
    if (JSON.stringify(value) !== this.props.value || errorMsg !== this.props.errorMsg) {
      this.setState({
        value,
        errorMsg,
      });
    }
  }

  onSingleChange = value => {
    let errorMsg = '';
    const {
      field: { name },
      required,
    } = this.props;
    if (required && !value) {
      errorMsg = `请选择${name}`;
    }
    this.setState(
      {
        value,
        errorMsg,
      },
      () => {
        this.props.onChange(value, errorMsg);
      }
    );
  };

  onMutiChange = value => {
    let errorMsg = '';
    const {
      field: { name },
      onChange,
    } = this.props;
    if (!value.length) {
      errorMsg = `请选择${name}`;
    }
    this.setState(
      {
        value,
        errorMsg,
      },
      () => {
        onChange(value, errorMsg);
      }
    );
  };

  onSelectChange = (value, muti) => {
    let errorMsg = '';
    const {
      field: { name },
      field,
      onChange,
    } = this.props;
    const options = field.available_options;
    if (!value.length) {
      errorMsg = `请选择${name}`;
    }
    this.setState(
      {
        value,
        errorMsg,
      },
      () => {
        const newOptions = options.filter(item => value.indexOf(item.value) > -1);
        let newValue = '';
        if (newOptions.length) {
          newValue = muti ? newOptions : newOptions[0];
        }
        onChange(newValue, errorMsg);
      }
    );
  };

  renderSelect = options => {
    const {
      field,
      field: { id },
      required,
      disabled,
    } = this.props;
    const { errorMsg, value } = this.state;
    const muti = field.is_checkbox;
    let newValue = '';
    if (value) {
      newValue = muti ? value.map(item => item.value) : value.value;
    }
    const newId = `${id}-select`;

    if (!muti) {
      const className = [style.select, errorMsg ? style.errorMsg : ''].join(' ');
      return (
        <FormItem {...field} errorMsg={errorMsg} required={required}>
          <div className={className} id={newId}>
            <Select
              disabled={disabled}
              options={options}
              value={newValue}
              getPopupContainer={() => document.getElementById(newId)}
              onChange={this.onSelectChange}
            />
          </div>
        </FormItem>
      );
    }
    const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
    return (
      <FormItem
        {...field}
        height="auto"
        errorMsg={errorMsg}
        required={required}
        extraStyle={{ height: 'auto', minWidth: '600px' }}
      >
        <div className={className} id={newId}>
          <Select
            options={options}
            mode="multiple"
            value={value}
            onChange={v => this.onSelectChange(v, 1)}
            getPopupContainer={() => document.getElementById(newId)}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  };

  render() {
    const { field, required, disabled, defaultValue } = this.props;
    const { errorMsg, value } = this.state;
    const multiple = field.is_checkbox;
    const options = field.available_options;

    // const newValue = value
    //   ? makeFieldValue(value, { value: 'staff_sn', text: 'realname' }, multiple)
    //   : '';
    // const newDefaultValue = defaultValue
    //   ? makeFieldValue(defaultValue, { value: 'staff_sn', text: 'realname' }, multiple)
    //   : '';
    const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
    if (options.length) {
      return this.renderSelect(options);
    }
    return (
      <FormItem
        {...field}
        width="500"
        height="auto"
        errorMsg={errorMsg}
        required={required}
        extraStyle={{ height: 'auto', minWidth: '600px' }}
      >
        <div className={className}>
          <SelectStaff
            multiple={multiple}
            defaultValue={defaultValue}
            value={value}
            effect="staff/fetchStaffs"
            onChange={multiple ? this.onMutiChange : this.onSingleChange}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  }
}

export default SelectStaffItem;
