import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import SelectShop from '../../SelectShop';
import Select from '../../Select';
import { judgeIsNothing, validValue } from '../../../utils/utils';
import style from './index.less';

@connect()
class ShopSelectItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = this.props;
    const shops = judgeIsNothing(defaultValue) ? defaultValue : '';
    this.state = {
      value: shops,
      errorMsg: '',
    };
  }

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
    this.dealValueOnChange(value);
  };

  onMutiChange = value => {
    this.dealValueOnChange(value);
  };

  onSelectChange = (value, muti) => {
    const { field } = this.props;
    const options = field.available_options;
    let newValue = '';
    if (muti) {
      newValue = options.filter(item => value.indexOf(item.value) > -1);
    } else {
      newValue = options.find(item => value === item.value);
    }
    this.dealValueOnChange(newValue || (muti ? [] : ''));
  };

  dealValueOnChange = value => {
    const { onChange } = this.props;
    const errorMsg = validValue(value, this.props);
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
              onChange={v => this.onSelectChange(v, 0)}
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
            value={newValue}
            onChange={v => this.onSelectChange(v, 1)}
            getPopupContainer={() => document.getElementById(newId)}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  };

  render() {
    const {
      field,
      field: { max, min },
      required,
      disabled,
      defaultValue,
    } = this.props;
    const { errorMsg, value } = this.state;
    const multiple = field.is_checkbox;
    const options = field.available_options;
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
          <SelectShop
            multiple={multiple}
            defaultValue={defaultValue}
            value={value}
            range={{ max, min }}
            effect="staff/fetchShops"
            onChange={multiple ? this.onMutiChange : this.onSingleChange}
            disabled={disabled}
          />
        </div>
      </FormItem>
    );
  }
}

export default ShopSelectItem;