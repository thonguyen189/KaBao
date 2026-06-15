export const DEFAULT_ITEM_ID = 'slipper';

export const ITEM_CATALOG = {
  slipper: {
    id: 'slipper',
    name: 'Dép thần tốc',
    shortName: 'Dép',
    price: 0,
    description: 'Vật phẩm mặc định, gọn nhẹ và quen tay.',
    frames: {
      idle: 'weaponSlipperIdle',
      windUp: 'weaponSlipperWindUp',
      swing: 'weaponSlipperSwing',
      end: 'weaponSlipperEnd',
      impact: 'weaponSlipperImpact'
    }
  },
  notebook: {
    id: 'notebook',
    name: 'Vở gió giấy',
    shortName: 'Vở',
    price: 40,
    description: 'Cú quạt giấy vui nhộn cho người chơi nhỏ tuổi.',
    frames: {
      idle: 'weaponNotebookIdle',
      windUp: 'weaponNotebookWindUp',
      swing: 'weaponNotebookSwing',
      end: 'weaponNotebookEnd',
      impact: 'weaponNotebookImpact'
    }
  },
  swatter: {
    id: 'swatter',
    name: 'Vợt muỗi điện',
    shortName: 'Vợt',
    price: 80,
    description: 'Hiệu ứng điện sáng rõ, chỉ thay đổi hình ảnh.',
    frames: {
      idle: 'weaponSwatterIdle',
      windUp: 'weaponSwatterWindUp',
      swing: 'weaponSwatterSwing',
      end: 'weaponSwatterEnd',
      impact: 'weaponSwatterImpact'
    }
  },
  phone: {
    id: 'phone',
    name: 'Điện thoại bộp',
    shortName: 'Điện thoại',
    price: 120,
    description: 'Một cú bộp hài hước, không ảnh hưởng điểm số.',
    frames: {
      idle: 'weaponPhoneIdle',
      windUp: 'weaponPhoneWindUp',
      swing: 'weaponPhoneSwing',
      end: 'weaponPhoneEnd',
      impact: 'weaponPhoneImpact'
    }
  }
};

export const SHOP_ITEM_IDS = ['slipper', 'notebook', 'swatter', 'phone'];

export function getItem(itemId) {
  return ITEM_CATALOG[itemId] ?? ITEM_CATALOG[DEFAULT_ITEM_ID];
}

export function isKnownItem(itemId) {
  return Boolean(ITEM_CATALOG[itemId]);
}
