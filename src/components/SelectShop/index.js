import React, { Component } from 'react';
import { Tag, AutoComplete } from 'antd';
import { connect } from 'dva';

import request from '../../utils/request';
import { makeFieldValue, judgeIsNothing } from '../../utils/utils';

import ShopModal from './ShopModal';
import style from './index.less';

const { Option } = AutoComplete;

@connect(({ loading, staff }) => ({
  loading,
  staff,
}))
class SelectShop extends Component {
  constructor(props) {
    super(props);
    const { value, multiple, defaultValue, name } = this.props;
    if (judgeIsNothing(defaultValue)) {
      const sNo = multiple
        ? defaultValue.map(item => item[name.shop_sn])
        : defaultValue[name.shop_sn];
      request('/api/oa/shops', {
        method: 'GET',
        body: { filters: `shop_sn=[${sNo}]` },
      }).then(response => {
        const res = response || [];
        this.setState({
          source: res,
          value: res.length
            ? makeFieldValue(
                multiple ? res : res[0],
                { shop_sn: 'value', name: 'text' },
                multiple,
                false
              )
            : '',
          visible: false,
          searchResult: [],
          serachValue: defaultValue[name.name],
        });
      });
    } else {
      this.state = {
        value,
        source: [],
        visible: false,
        searchResult: [],
        serachValue: '',
      };
    }
    this.multiple = multiple;
  }

  componentWillReceiveProps(props) {
    const { value } = props;
    if (JSON.stringify(value) !== JSON.stringify(this.props.value)) {
      this.setState({
        value,
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(this.state) !== JSON.stringify(nextState) ||
      JSON.stringify(nextProps) !== JSON.stringify(this.props)
    );
  }

  onClose = e => {
    e.preventDefault();
    e.stopPropagation();
    // this.setState({
    //   visible: false
    // })
  };

  onDelete = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const { value, source } = this.state;
    const { name } = this.props;
    const newValue = this.multiple ? value.filter(v => v[name.shop_sn] !== item.shop_sn) : '';
    const newSource = this.multiple ? source.filter(v => v.shop_sn !== item.shop_sn) : '';

    this.setState(
      {
        value: newValue,
        source: newSource,
      },
      () => {
        this.props.onChange(newValue);
      }
    );
  };

  onSelect = v => {
    const { searchResult } = this.state;
    const { name, onChange } = this.props;
    const result = searchResult.find(item => `${item.id}` === `${v}`);
    const newValue = makeFieldValue(
      result,
      { shop_sn: name.shop_sn, name: name.name },
      false,
      false
    );
    this.setState(
      {
        value: newValue,
        source: [result],
        serachValue: result.name,
      },
      () => {
        onChange(newValue);
      }
    );
  };

  onMaskChange = (visible, value) => {
    const { name } = this.props;
    const isNothing = !judgeIsNothing(value);
    const newValue = !isNothing
      ? makeFieldValue(value, { shop_sn: name.shop_sn, name: name.name }, this.multiple, false)
      : '';
    let source = '';
    if (isNothing) {
      source = [];
    } else {
      source = this.multiple ? value : [value];
    }
    this.setState(
      {
        visible,
        value: newValue,
        source,
        serachValue: !this.multiple ? value.name : '',
      },
      () => {
        this.props.onChange(newValue);
      }
    );
  };

  handleClick = () => {
    this.setState({
      visible: true,
    });
  };

  fetchDataSource = (params, cb) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'staff/fetchShops',
      payload: {
        params: {
          ...params,
        },
        cb: cb || '',
      },
    });
  };

  searchChange = value => {
    this.setState({ serachValue: value });
    request('/api/oa/shops', {
      method: 'GET',
      body: {
        page: 1,
        pagesize: 10,
        filters: value ? `name~${value}` : '',
      },
    }).then(res => {
      this.setState({
        searchResult: res.data,
        fetch: true,
      });
    });
  };

  renderSingle = () => {
    const { searchResult, value, serachValue } = this.state;
    const { description, name } = this.props;
    const children = searchResult.length ? (
      searchResult.map(r => <Option key={r.id}>{r.name}</Option>)
    ) : (
      <Option key="nothing" disabled>
        无匹配结果
      </Option>
    );
    return (
      <div className={style.single_result}>
        <span
          className={style.search_icon}
          onClick={!this.props.disabled ? this.handleClick : () => {}}
        />
        <div className={style.single_search} title={serachValue}>
          <AutoComplete
            onSearch={this.searchChange}
            onFocus={() => {
              this.setState({ serachValue: '' });
            }}
            disabled={this.props.disabled}
            onBlur={() => {
              this.setState({ serachValue: value ? value[name.name] : '' });
            }}
            dataSource={searchResult.length ? children : [children]}
            placeholder={value ? value[name.name] : '' || description || '请输入'}
            onSelect={this.onSelect}
            value={serachValue}
          />
        </div>
      </div>
    );
  };

  render() {
    const { selfStyle, multiple, range, disabled } = this.props;
    if (!this.state) {
      return null;
    }
    const { source } = this.state;
    return (
      <div className={style.tag_container} onClick={e => e.stopPropagation()}>
        {this.multiple ? (
          <div
            className={style.result}
            style={{ ...selfStyle }}
            onClick={disabled ? () => {} : this.handleClick}
          >
            <div className={style.tagItem}>
              {source.map(item => (
                <Tag
                  closable
                  key={item.shop_sn}
                  onClose={e => this.onDelete(e, item)}
                  title={item.name}
                >
                  {item.name}
                </Tag>
              ))}
            </div>
            {!source.length ? <span className={style.placeholder}>请选择</span> : null}
          </div>
        ) : (
          this.renderSingle()
        )}
        <ShopModal
          visible={this.state.visible}
          onChange={this.onMaskChange}
          onCancel={() => this.setState({ visible: false })}
          multiple={multiple}
          fetchUrl="/api/oa/shops"
          range={range}
          checkedShop={source}
          fetchDataSource={this.fetchDataSource}
        />
      </div>
    );
  }
}
SelectShop.defaultProps = {
  name: { name: 'text', shop_sn: 'value' },
  onChange: () => {},
  effect: 'staff/fetchShops',
};
export default SelectShop;
