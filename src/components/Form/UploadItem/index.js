import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FileUpload from '../../FileUpload';
import FormItem from '../FormItem';
import { dealThumbImg } from '../../../utils/convert';
import { isImage } from '../../../utils/utils';
import style from './index.less';

@connect()
class UploadItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = props;
    const files = (defaultValue || []).map((its, i) => {
      const file = this.dealFiles(its, i);
      return file;
    });
    this.state = {
      value: files,
      errorMsg: '',
    };
  }

  onChange = (value, deal = true) => {
    const {
      onChange,
      field: { name },
    } = this.props;
    let files = [...value];
    if (deal) {
      files = (value || []).map((its, i) => {
        const file = this.dealFiles(its, i);
        return file;
      });
    } else {
      files = (value || []).map(its => {
        const file = { ...its };
        return file;
      });
    }
    let errorMsg = '';
    if (!value.length) {
      errorMsg = `请上传${name}`;
    }
    this.setState(
      {
        value: files,
        errorMsg,
      },
      () => {
        onChange(value, errorMsg);
      }
    );
  };

  dealFiles = (f, i) => {
    const isPic = isImage(f);
    let file = '';
    if (isPic) {
      file = { url: `${UPLOAD_PATH}${dealThumbImg(f, '_thumb')}`, uid: i };
    } else {
      file = { url: `${UPLOAD_PATH}${f}`, uid: i };
    }
    return file;
  };

  validateFile = (rule, value, callback) => {
    const { required } = this.props;
    if (required && (!value || value.length === 0)) {
      callback();
    } else callback();
  };

  render() {
    const { field, required, disabled } = this.props;
    const { errorMsg, value } = this.state;
    const className = [errorMsg ? style.errorMsg : style.noerror, style.upfile].join(' ');
    return (
      <FormItem
        {...field}
        required={required}
        errorMsg={errorMsg}
        width="900px"
        height="auto"
        className="file"
      >
        <div className={className}>
          <FileUpload url="/api/files" value={value} onChange={this.onChange} disabled={disabled} />
        </div>
      </FormItem>
    );
  }
}
UploadItem.defaultProps = {
  onChange: () => {},
};
export default UploadItem;