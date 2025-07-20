import { Globe, Phone, ShoppingBag, Truck, Utensils } from "lucide-react";

export type OrderType = "Dine In" | "Take Away" | "Delivery" | "Phone In" | "Aggregators";

export type OrderTypes= {
    label: string;
    value: OrderType;
    icon: React.ElementType;
}

export const ORDER_TYPES: OrderTypes[] = [
    {
        label: "Dine In",
        value: "Dine In",
        icon: Utensils
    },
    {
        label: "Take Away",
        value: "Take Away",
        icon: ShoppingBag
    },
    {
        label: "Delivery",
        value: "Delivery",
        icon: Truck
    },
    {
        label: "Phone In",
        value: "Phone In",
        icon: Phone
    },
    {
        label: "Aggregators",
        value: "Aggregators",
        icon: Globe
    }
]

export const DINE_IN="Dine In"
export const DEFAULT_ORDER_TYPE="Take Away"

export type OrderStatusType = "Draft" | "Unbilled" | "Paid" | "Consolidated" | "Return";

// Base status types that are always available
export const BASE_ORDER_STATUS_TYPES = [
    {
        label: "Draft",
        value: "Draft"
    },
    {
        label: "Unbilled",
        value: "Unbilled"
    }
];

// Extended status types that are only available when view_all_status is enabled
export const EXTENDED_ORDER_STATUS_TYPES = [
    {
        label: "Paid",
        value: "Paid"
    },
    {
        label: "Consolidated",
        value: "Consolidated"
    },
    {
        label: "Return",
        value: "Return"
    }
];

// Function to get order status types based on POS profile settings
export const getOrderStatusTypes = (viewAllStatus?: number) => {
    if (viewAllStatus === 1) {
        return [...BASE_ORDER_STATUS_TYPES, ...EXTENDED_ORDER_STATUS_TYPES];
    }
    return BASE_ORDER_STATUS_TYPES;
};

// Legacy export for backward compatibility
export const ORDER_STATUS_TYPES = BASE_ORDER_STATUS_TYPES;