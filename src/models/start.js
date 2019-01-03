import { notification } from 'antd';

import {
  getFlowList,
  getFlowInfo,
  preSet,
  getStartList,
  stepStart,
  doWithdraw,
  startDetail,
} from '../services/start';
import defaultReducers from '../reducers';

export default {
  namespace: 'start',
  state: {
    flowDetails: {},
    availableFlows: [],
    processingStart: {},
    preStepData: {
      available_steps: [
        {
          id: 408,
          name: '第二步',
          approver_type: 0,
          approvers: [],
        },
        {
          id: 409,
          name: 'test',
          approver_type: 0,
          approvers: [],
        },
      ],
      step_end: 0,
      timestamp: 1546483127,
      concurrent_type: 1,
      flow_id: 93,
      step_run_id: null,
      message: '',
      is_cc: '1',
      cc_person: [
        {
          staff_name: '刘勇01',
          staff_sn: 110103,
        },
      ],
    },
    startDetails: {},
  },

  subscriptions: {},

  effects: {
    *getFlows(_, { call, put, select }) {
      const { availableFlows } = yield select(model => model.start);
      if (availableFlows.length) {
        return;
      }
      const data = yield call(getFlowList);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            store: 'availableFlows',
            data,
          },
        });
      }
    },

    *getFlowInfo({ payload }, { call, put }) {
      const { id, cb } = payload;
      const data = yield call(getFlowInfo, id);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            id,
            store: 'flow',
            data,
          },
        });
        if (cb) {
          cb(data);
        }
      }
    },

    // 预提交
    *preSet({ payload }, { call, put }) {
      const data = yield call(preSet, payload.data);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            store: 'preStepData',
            data,
          },
        });

        if (payload.cb) {
          payload.cb(data);
        }
      } else if (data.status === 422) {
        payload.cb(data);
      }
    },
    // 正式提交
    *stepStart({ payload }, { call }) {
      const data = yield call(stepStart, payload.data);
      if (data && !data.error) {
        payload.cb();
      }
    },

    *fetchStartList({ payload }, { call, put }) {
      const { params } = payload;
      const data = yield call(getStartList, params);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            data,
            store: `${params.type}Start`,
          },
        });
      }
    },
    *fetchStepInfo({ payload }, { call, put }) {
      const data = yield call(startDetail, payload);
      if (data && !data.error) {
        yield put({
          type: 'save',
          payload: {
            data,
            store: 'start',
            id: payload,
          },
        });
      }
    },

    *doWithDraw(
      {
        payload: { params, cb },
      },
      { call, put }
    ) {
      const data = yield call(doWithdraw, params);
      if (data && !data.error) {
        notification.success({
          message: '操作成功',
        });
        yield put({
          type: 'updateList',
          payload: {
            id: params.flow_run_id,
            store: 'processingStart',
            noti: false,
            data,
          },
        });
        if (cb) {
          cb();
        }
      }
    },
  },

  reducers: {
    ...defaultReducers,
  },
};
