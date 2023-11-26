import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Dropdown, Space, Tag } from 'antd';
import { useRef } from 'react';
import { request } from '@umijs/max';
import {queryAllUserList} from '@/services/api/user';
export const waitTimePromise = async (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};

// const dataSource: CustomItem[] = [
//   {
//     key: '1',
//     name: '胡彦斌',
//     age: 32,
//     address: '西湖区湖底公园1号',
//   },
//   {
//     key: '2',
//     name: '胡彦祖',
//     age: 42,
//     address: '西湖区湖底公园1号',
//   },
// ];

const columns: ProColumns<CustomItem>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '住址',
    dataIndex: 'address',
    key: 'address',
  },
];

type CustomItem = {
  
  key: string;
  name: string;
  age: number;
  address: string;
};


// const columns: ProColumns<GithubIssueItem>[] = [
//   {
//     dataIndex: 'index',
//     valueType: 'indexBorder',
//     width: 48,
//   },
//   {
//     title: '标题',
//     dataIndex: 'title',
//     copyable: true,
//     ellipsis: true,
//     tip: '标题过长会自动收缩',
//     formItemProps: {
//       rules: [
//         {
//           required: true,
//           message: '此项为必填项',
//         },
//       ],
//     },
//   },
//   {
//     disable: true,
//     title: '状态',
//     dataIndex: 'state',
//     filters: true,
//     onFilter: true,
//     ellipsis: true,
//     valueType: 'select',
//     valueEnum: {
//       all: { text: '超长'.repeat(50) },
//       open: {
//         text: '未解决',
//         status: 'Error',
//       },
//       closed: {
//         text: '已解决',
//         status: 'Success',
//         disabled: true,
//       },
//       processing: {
//         text: '解决中',
//         status: 'Processing',
//       },
//     },
//   },
//   {
//     disable: true,
//     title: '标签',
//     dataIndex: 'labels',
//     search: false,
//     renderFormItem: (_, { defaultRender }) => {
//       return defaultRender(_);
//     },
//     render: (_, record) => (
//       <Space>
//         {record.labels.map(({ name, color }) => (
//           <Tag color={color} key={name}>
//             {name}
//           </Tag>
//         ))}
//       </Space>
//     ),
//   },
//   {
//     title: '创建时间',
//     key: 'showTime',
//     dataIndex: 'created_at',
//     valueType: 'date',
//     sorter: true,
//     hideInSearch: true,
//   },
//   {
//     title: '创建时间',
//     dataIndex: 'created_at',
//     valueType: 'dateRange',
//     hideInTable: true,
//     search: {
//       transform: (value) => {
//         return {
//           startTime: value[0],
//           endTime: value[1],
//         };
//       },
//     },
//   },
//   {
//     title: '操作',
//     valueType: 'option',
//     key: 'option',
//     render: (text, record, _, action) => [
//       <a
//         key="editable"
//         onClick={() => {
//           action?.startEditable?.(record.id);
//         }}
//       >
//         编辑
//       </a>,
//       <a href={record.url} target="_blank" rel="noopener noreferrer" key="view">
//         查看
//       </a>,
//       <TableDropdown
//         key="actionGroup"
//         onSelect={() => action?.reload()}
//         menus={[
//           { key: 'copy', name: '复制' },
//           { key: 'delete', name: '删除' },
//         ]}
//       />,
//     ],
//   },
// ];

const Test: React.FC = () => {
  const actionRef = useRef<ActionType>();
  // const func = async () => {
  //   const msg = await queryAllUserList({}) as API.ResponseParams;
  //   if (msg.code === 200) {
  //     console.log(msg.data);
  //     // for (let i = 0; i < msg.data.list.length; i++) {
  //     //   if (currentUser?.role_name !== 'super' && (msg.data.list[i].role_name === 'super' || msg.data.list[i].role_name === 'admin')) {
  //     //     continue
  //     //   }
  //     //   obj[msg.data.list[i].id] = {
  //     //     text: msg.data.list[i].role_name, status: msg.data.list[i].id,
  //     //   }
  //     // }
  //   }
  // }; 
  // func();

  return (
    <ProTable<CustomItem>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      // dataSource={dataSource}
      request={async (params, sort, filter) => {
        let data = [];
        const msg = await queryAllUserList({}) as API.ResponseParams;
        if (msg.code === 200) {
          // console.log(msg.data);
          for (let i = 0; i < msg.data.length; i++) {
            data.push({
              name: msg.data[i].userName,
              age: msg.data[i].age || 0,
              address: msg.data[i].address,
              key: i.toString()
            })
          }
          // for (let i = 0; i < msg.data.list.length; i++) {
          //   if (currentUser?.role_name !== 'super' && (msg.data.list[i].role_name === 'super' || msg.data.list[i].role_name === 'admin')) {
          //     continue
          //   }
          //   obj[msg.data.list[i].id] = {
          //     text: msg.data.list[i].role_name, status: msg.data.list[i].id,
          //   }
          // }
        }
        console.log(data);
        return {

          data: data,
          total: 0,
          success: true
        }
      }}
      // editable={{
      //   type: 'multiple',
      // }}
      // columnsState={{
      //   persistenceKey: 'pro-table-singe-demos',
      //   persistenceType: 'localStorage',
      //   onChange(value) {
      //     console.log('value: ', value);
      //   },
      // }}
      
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      options={{
        setting: {
          listsHeight: 400,
        },
      }}
      form={{
        // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
        syncToUrl: (values, type) => {
          if (type === 'get') {
            return {
              ...values,
              created_at: [values.startTime, values.endTime],
            };
          }
          return values;
        },
      }}
      pagination={{
        pageSize: 5,
        onChange: (page) => console.log(page),
      }}
      dateFormatter="string"
      headerTitle="高级表格"
      toolBarRender={() => [
        <Button
          key="button"
          icon={<PlusOutlined />}
          onClick={() => {
            actionRef.current?.reload();
          }}
          type="primary"
        >
          新建
        </Button>,
        <Dropdown
          key="menu"
          menu={{
            items: [
              {
                label: '1st item',
                key: '1',
              },
              {
                label: '2nd item',
                key: '1',
              },
              {
                label: '3rd item',
                key: '1',
              },
            ],
          }}
        >
          <Button>
            <EllipsisOutlined />
          </Button>
        </Dropdown>,
      ]}
    />
  );
};
export default Test;