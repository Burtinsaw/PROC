// project imports
import { useGetMenu } from 'api/menu';

// assets
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import GoldOutlined from '@ant-design/icons/GoldOutlined';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';

// type
import { NavItemType } from 'types/menu';

const icons = { dashboard: DashboardOutlined, components: GoldOutlined, loading: LoadingOutlined };

const invoiceItem = { id: 'invoice1', title: 'invoice', type: 'item', url: '/dashboard/invoice', breadcrumbs: false };

const loadingMenu: NavItemType = {
  id: 'group-dashboard-loading',
  title: 'dashboard',
  type: 'group',
  icon: icons.loading,
  children: [
    {
      id: 'dashboard1',
      title: 'dashboard',
      type: 'collapse',
      icon: icons.loading,
      children: [
        {
          id: 'default1',
          title: 'loading',
          type: 'item',
          url: '/dashboard/default',
          breadcrumbs: false
        },
        {
          id: 'analytics1',
          title: 'loading',
          type: 'item',
          url: '/dashboard/analytics',
          breadcrumbs: false
        },
        invoiceItem
      ]
    }
  ]
};

const defaultMenu: NavItemType = {
  id: 'group-dashboard-loading',
  title: 'dashboard',
  type: 'group',
  icon: icons.dashboard,
  children: [
    {
      id: 'dashboard1',
      title: 'dashboard',
      type: 'collapse',
      icon: icons.dashboard,
      children: [invoiceItem]
    }
  ]
};

// ==============================|| MENU ITEMS - API ||============================== //

export function MenuFromAPI() {
  const { menu, menuLoading } = useGetMenu();

  if (menuLoading) return loadingMenu;

  const subChildrenList = (children: NavItemType[]) => {
    return children?.map((subList: NavItemType) => {
      return fillItem(subList);
    });
  };

  const itemList = (subList: NavItemType) => {
    const list = fillItem(subList);

    // if collapsible item, we need to feel its children as well
    if (subList.type === 'collapse') {
      list.children = subChildrenList(subList.children!);
    }
    return list;
  };

  const childrenList: NavItemType[] | undefined = menu?.children?.map((subList: NavItemType) => {
    return itemList(subList);
  });

  if (!childrenList?.length) return defaultMenu;

  const menuList = fillItem(menu, childrenList);
  return menuList;
}

function fillItem(item: NavItemType, children?: NavItemType[] | undefined) {
  return {
    ...item,
    title: item?.title,
    icon: item?.icon ? icons[item.icon as keyof typeof icons] : undefined,
    ...(children && { children })
  };
}
