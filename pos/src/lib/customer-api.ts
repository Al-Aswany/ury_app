import { db } from './frappe-sdk';

export async function getCustomerGroups() {
  const groups = await db.getDocList('Customer Group', {
    fields: ['name'],
    limit: "*" as unknown as number,
    orderBy: {
      field: 'name',
      order: 'asc',
    },
  });
  return groups;
}

export async function getCustomerTerritories() {
  const territories = await db.getDocList('Territory', {
    fields: ['name'],
    limit: "*" as unknown as number,
    orderBy: {
      field: 'name',
      order: 'asc',
    },
  });
  return territories;
}

export async function addCustomer() {

}

export async function searchCustomers() {
    
}