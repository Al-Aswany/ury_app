import { call } from './frappe-sdk';

export interface MenuItem {
  item: string;
  item_name: string;
  item_imgae: string | null;
  rate: number | string;
  course: string;
  trending?: boolean;
  popular?: boolean;
  recommended?: boolean;
  description?: string;
}

export interface GetMenuResponse {
  message: {
    items: MenuItem[];
  };
}

export const getRestaurantMenu = async (posProfile: string, orderType?: string) => {
  try {
    const response = await call.get<GetMenuResponse>(
      'ury.ury_pos.api.getRestaurantMenu',
      {
        pos_profile: posProfile,
        order_type: orderType || null
      }
    );
    return response.message.items;
  } catch (error: any) {
    if (error._server_messages) {
      const messages = JSON.parse(error._server_messages);
      const message = JSON.parse(messages[0]);
      throw new Error(message.message);
    }
    throw error;
  }
};

export const getAggregatorMenu = async (aggregator: string) => {
  try {
    const response = await call.get<GetMenuResponse>(
      'ury.ury_pos.api.getAggregatorItem',
      {
        aggregator
      }
    );
    return response.message.items;
  } catch (error: any) {
    if (error._server_messages) {
      const messages = JSON.parse(error._server_messages);
      const message = JSON.parse(messages[0]);
      throw new Error(message.message);
    }
    throw error;
  }
}; 