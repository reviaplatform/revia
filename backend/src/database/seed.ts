import '../config/init';

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { initDB } from './init';
import { log } from '@/log';
import { PASSWORD_SALT_ROUNDS } from '@/core/types';
import { uploadFile } from '@/core/utils/storage';

import AdminModel, { AdminRole, IAdminDB } from './models/admin';
import CustomerModel, { CustomerGender, CustomerStatus, ICustomerDB } from './models/customer';
import ProviderModel, { ProviderRole, IProviderDB } from './models/provider';
import BrandModel, { IBrandDB } from './models/brand';
import CategoryModel from './models/category';
import DeviceModel, { DevicePlatform, IDeviceDB } from './models/device';
import RepairRequestModel, { RepairRequestFlow, RepairRequestStatus } from './models/repairRequest';
import BrandOfferModel, { BrandOfferStatus } from './models/brandOffer';
import InspectionModel from './models/inspection';
import PaymentModel, { PaymentMethod, PaymentStatus, PaymentType } from './models/payment';
import BrandReviewModel from './models/brandReview';
import BrandPayoutModel, { PayoutMethod, PayoutStatus } from './models/brandPayout';
import BrandWalletTransactionModel, {
  WalletTransactionDirection,
  WalletTransactionType,
} from './models/brandWalletTransaction';
import ReelModel from './models/reel';
import ReelLikeModel from './models/reelLike';
import BrandSubscriptionConfigModel from './models/brandSubscriptionConfig';
import BrandSubscriptionModel, { SubscriptionStatus } from './models/brandSubscription';
import SupportTicketModel, { SupportTicketPriority, SupportTicketSenderType, SupportTicketStatus } from './models/supportTicket';

const TEST_PHONE = '01111111111';
const TEST_PASSWORD = '12345678';

interface BrandAndProvider {
  brand: IBrandDB;
  /** Primary owner used for payouts/repair-request seeding */
  provider: IProviderDB;
  /** Every provider seeded for this brand (primary owner + any extra staff) */
  providers: IProviderDB[];
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`[seed] failed to download ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ─────────────────────────────────────────────────────────────────────────────
// Admins
// ─────────────────────────────────────────────────────────────────────────────

const EXTRA_ADMIN_DEFS = [
  { name: 'Mona Adel', email: 'mona.adel@revia.com', phoneNumber: '01055566677', role: AdminRole.MANAGER, banned: false },
  { name: 'Khaled Ibrahim', email: 'khaled.ibrahim@revia.com', phoneNumber: '01066677788', role: AdminRole.ADMIN, banned: false },
  { name: 'Yasmine Tarek', email: 'yasmine.tarek@revia.com', phoneNumber: '01088899900', role: AdminRole.MANAGER, banned: true },
  { name: 'Hany Said', email: 'hany.said@revia.com', phoneNumber: '01077788899', role: AdminRole.ADMIN, banned: false },
];

async function seedAdmins(): Promise<IAdminDB[]> {
  const admins: IAdminDB[] = [];

  let mainAdmin = await AdminModel.findOne({ email: 'admin@test.com' });
  if (!mainAdmin) {
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, PASSWORD_SALT_ROUNDS);
    mainAdmin = await AdminModel.create({
      name: 'Revia Admin',
      email: 'admin@test.com',
      phoneNumber: TEST_PHONE,
      password: hashedPassword,
      role: AdminRole.ADMIN,
    });
    log.info('[seed] created admin admin@test.com');
  }
  admins.push(mainAdmin);

  for (const def of EXTRA_ADMIN_DEFS) {
    let admin = await AdminModel.findOne({ email: def.email });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, PASSWORD_SALT_ROUNDS);
      admin = await AdminModel.create({
        name: def.name,
        email: def.email,
        phoneNumber: def.phoneNumber,
        role: def.role,
        password: hashedPassword,
        deletedAt: def.banned ? new Date() : null,
      });
      log.info(`[seed] created admin ${def.email}${def.banned ? ' (banned)' : ''}`);
    }
    admins.push(admin);
  }

  return admins;
}

// ─────────────────────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_DEFS = [
  { name: { en: 'Smartphones', ar: 'الهواتف الذكية' }, commissionPerRequest: 10 },
  { name: { en: 'Laptops', ar: 'أجهزة الكمبيوتر المحمولة' }, commissionPerRequest: 10 },
];

async function seedCategories(): Promise<Record<string, mongoose.Types.ObjectId>> {
  const categories: Record<string, mongoose.Types.ObjectId> = {};

  for (const def of CATEGORY_DEFS) {
    let category = await CategoryModel.findOne({ 'name.en': def.name.en });
    if (!category) {
      category = await CategoryModel.create(def);
      log.info(`[seed] created category ${def.name.en}`);
    }
    categories[def.name.en] = category._id as mongoose.Types.ObjectId;
  }

  return categories;
}

// ─────────────────────────────────────────────────────────────────────────────
// Brands + Providers
// ─────────────────────────────────────────────────────────────────────────────

interface ProviderDef {
  name: string;
  email: string;
  phoneNumber: string;
  banned?: boolean;
}

interface BrandDef {
  crn: string;
  tin: string;
  name: { en: string; ar: string };
  logoSeed: string;
  categoryNames: string[];
  branches: { name: { en: string; ar: string }; location: { longitude: number; latitude: number } }[];
  tags: string[];
  providers: ProviderDef[];
}

const BRAND_DEFS: BrandDef[] = [
  {
    crn: 'CRN-100200300',
    tin: 'TIN-900800700',
    name: { en: 'TechFix Egypt', ar: 'تك فيكس مصر' },
    logoSeed: 'revia-logo-techfix',
    categoryNames: ['Smartphones', 'Laptops'],
    branches: [
      { name: { en: 'Nasr City Branch', ar: 'فرع مدينة نصر' }, location: { longitude: 31.347, latitude: 30.0626 } },
      { name: { en: 'Maadi Branch', ar: 'فرع المعادي' }, location: { longitude: 31.2599, latitude: 29.9602 } },
    ],
    tags: ['fast-repair', 'certified'],
    providers: [
      { name: 'Mohamed Hassan', email: 'provider@test.com', phoneNumber: TEST_PHONE },
      { name: 'Heba Younis', email: 'heba.younis@test.com', phoneNumber: '01022211100' },
    ],
  },
  {
    crn: 'CRN-200300400',
    tin: 'TIN-800700600',
    name: { en: 'QuickFix Mobile', ar: 'كويك فيكس موبايل' },
    logoSeed: 'revia-logo-quickfix',
    categoryNames: ['Smartphones'],
    branches: [
      { name: { en: 'Alexandria Branch', ar: 'فرع الإسكندرية' }, location: { longitude: 29.9187, latitude: 31.2001 } },
    ],
    tags: ['mobile-only', 'same-day'],
    providers: [
      { name: 'Yara Mostafa', email: 'provider2@test.com', phoneNumber: '01099887766' },
      { name: 'Ziad Naguib', email: 'ziad.naguib@test.com', phoneNumber: '01033322200', banned: true },
    ],
  },
  {
    crn: 'CRN-300400500',
    tin: 'TIN-700600500',
    name: { en: 'ProCare Electronics', ar: 'بروكير للإلكترونيات' },
    logoSeed: 'revia-logo-procare',
    categoryNames: ['Smartphones', 'Laptops'],
    branches: [
      { name: { en: '6th of October Branch', ar: 'فرع السادس من أكتوبر' }, location: { longitude: 30.9168, latitude: 29.9097 } },
      { name: { en: 'Heliopolis Branch', ar: 'فرع مصر الجديدة' }, location: { longitude: 31.3243, latitude: 30.0808 } },
    ],
    tags: ['certified', 'warranty'],
    providers: [
      { name: 'Tarek Fathy', email: 'provider3@test.com', phoneNumber: '01077665544' },
      { name: 'Nour Adly', email: 'nour.adly@test.com', phoneNumber: '01044433300' },
    ],
  },
];

async function seedBrandsAndProviders(
  categories: Record<string, mongoose.Types.ObjectId>,
): Promise<BrandAndProvider[]> {
  const results: BrandAndProvider[] = [];

  for (const def of BRAND_DEFS) {
    let brand = await BrandModel.findOne({ crn: def.crn });

    if (!brand) {
      const logoKey = `seed/${def.logoSeed}.jpg`;
      const logoBuffer = await fetchBuffer(`https://picsum.photos/seed/${def.logoSeed}/300/300.jpg`);
      await uploadFile(logoBuffer, logoKey, 'image/jpeg');

      brand = await BrandModel.create({
        logo: logoKey,
        name: def.name,
        crn: def.crn,
        tin: def.tin,
        categories: def.categoryNames.map((name) => categories[name]),
        branches: def.branches.map((branch) => ({ ...branch, isActive: true })),
        tags: def.tags,
        allowPayUsePOS: true,
        approvedAt: new Date(),
      });
      log.info(`[seed] created brand ${def.name.en}`);
    }

    const providers: IProviderDB[] = [];
    for (const providerDef of def.providers) {
      let provider = await ProviderModel.findOne({ email: providerDef.email });
      if (!provider) {
        const hashedPassword = await bcrypt.hash(TEST_PASSWORD, PASSWORD_SALT_ROUNDS);
        provider = await ProviderModel.create({
          name: providerDef.name,
          email: providerDef.email,
          phoneNumber: providerDef.phoneNumber,
          password: hashedPassword,
          role: ProviderRole.OWNER,
          brandId: brand._id,
          deletedAt: providerDef.banned ? new Date() : null,
        });
        log.info(`[seed] created provider ${providerDef.email}${providerDef.banned ? ' (banned)' : ''}`);
      }
      providers.push(provider as IProviderDB);
    }

    results.push({ brand: brand as IBrandDB, provider: providers[0]!, providers });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────────────────────────────────────

const EXTRA_CUSTOMER_DEFS = [
  {
    name: 'Sara Ahmed',
    phoneNumber: '01022233344',
    email: 'sara.ahmed@example.com',
    gender: CustomerGender.FEMALE,
    birthday: '15:06:1998',
  },
  {
    name: 'Omar Khaled',
    phoneNumber: '01133344455',
    email: 'omar.khaled@example.com',
    gender: CustomerGender.MALE,
    birthday: '22:09:1995',
  },
  {
    name: 'Mona Saeed',
    phoneNumber: '01044455566',
    email: 'mona.saeed@example.com',
    gender: CustomerGender.FEMALE,
    birthday: '10:03:1999',
  },
  {
    name: 'Karim Adel',
    phoneNumber: '01155566677',
    email: 'karim.adel@example.com',
    gender: CustomerGender.MALE,
    birthday: '05:11:2001',
  },
  {
    name: 'Reem Hassan',
    phoneNumber: '01166677788',
    email: 'reem.hassan@example.com',
    gender: CustomerGender.FEMALE,
    birthday: '18:07:1997',
    status: CustomerStatus.BANNED,
  },
  {
    name: 'Tamer Fouad',
    phoneNumber: '01177788899',
    email: 'tamer.fouad@example.com',
    gender: CustomerGender.MALE,
    birthday: '30:04:1993',
    status: CustomerStatus.DELETED,
  },
];

async function seedCustomers(): Promise<ICustomerDB[]> {
  const customers: ICustomerDB[] = [];

  let mainCustomer = await CustomerModel.findOne({ email: 'user@test.com' });
  if (!mainCustomer) {
    mainCustomer = await CustomerModel.create({
      name: 'Ahmed Youssef',
      phoneNumber: TEST_PHONE,
      email: 'user@test.com',
      gender: CustomerGender.MALE,
      birthday: '01:01:2000',
      status: CustomerStatus.ACTIVE,
    });
    log.info('[seed] created customer user@test.com');
  }
  customers.push(mainCustomer);

  for (const def of EXTRA_CUSTOMER_DEFS) {
    let customer = await CustomerModel.findOne({ email: def.email });
    if (!customer) {
      const status = def.status ?? CustomerStatus.ACTIVE;
      customer = await CustomerModel.create({
        ...def,
        status,
        deletedAt: status === CustomerStatus.ACTIVE ? null : new Date(),
      });
      log.info(`[seed] created customer ${def.email} (${status})`);
    }
    customers.push(customer);
  }

  return customers;
}

// ─────────────────────────────────────────────────────────────────────────────
// Devices
// ─────────────────────────────────────────────────────────────────────────────

const DEVICE_DEFS = [
  {
    name: 'iPhone 13',
    manufacturer: 'Apple',
    deviceModel: 'A2633',
    platform: DevicePlatform.IOS,
    osVersion: '17.4',
    category: 'Smartphones',
  },
  {
    name: 'MacBook Pro 14',
    manufacturer: 'Apple',
    deviceModel: 'A2779',
    platform: DevicePlatform.MACOS,
    osVersion: '14.2',
    category: 'Laptops',
  },
  {
    name: 'Galaxy S22',
    manufacturer: 'Samsung',
    deviceModel: 'SM-S901B',
    platform: DevicePlatform.ANDROID,
    osVersion: '13',
    category: 'Smartphones',
  },
];

async function seedDevices(
  customers: ICustomerDB[],
  categories: Record<string, mongoose.Types.ObjectId>,
): Promise<IDeviceDB[]> {
  const devices: IDeviceDB[] = [];

  for (let i = 0; i < customers.length; i++) {
    const def = DEVICE_DEFS[i % DEVICE_DEFS.length]!;
    let device = await DeviceModel.findOne({ customerId: customers[i]!._id, name: def.name });
    if (!device) {
      device = await DeviceModel.create({
        customerId: customers[i]!._id,
        categoryId: categories[def.category],
        name: def.name,
        manufacturer: def.manufacturer,
        deviceModel: def.deviceModel,
        platform: def.platform,
        osVersion: def.osVersion,
      });
      log.info(`[seed] created device ${def.name} for ${customers[i]!.email}`);
    }
    devices.push(device);
  }

  return devices;
}

// ─────────────────────────────────────────────────────────────────────────────
// Repair requests (+ offers / inspections / payments / wallet credits / reviews)
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_ORDER = [
  RepairRequestStatus.AI_ASSESSING,
  RepairRequestStatus.PENDING_BRAND_SELECTION,
  RepairRequestStatus.PENDING_OFFERS,
  RepairRequestStatus.OFFER_SELECTED,
  RepairRequestStatus.INSPECTION_PENDING,
  RepairRequestStatus.INSPECTION_DONE,
  RepairRequestStatus.PAYMENT_PENDING,
  RepairRequestStatus.PAYMENT_DONE,
  RepairRequestStatus.PENDING_PROVIDER_REPAIR,
  RepairRequestStatus.PENDING_USER_DEVICE_PICKUP,
  RepairRequestStatus.COMPLETED,
];

const OFFER_SELECTED_IDX = STATUS_ORDER.indexOf(RepairRequestStatus.OFFER_SELECTED);
const INSPECTION_DONE_IDX = STATUS_ORDER.indexOf(RepairRequestStatus.INSPECTION_DONE);
const PAYMENT_DONE_IDX = STATUS_ORDER.indexOf(RepairRequestStatus.PAYMENT_DONE);

interface RepairScenario {
  customerIdx: number;
  deviceIdx: number;
  flow: RepairRequestFlow;
  finalStatus: RepairRequestStatus;
  issueText: string;
  offer?: { inspectionPrice: number; finalPrice: number; expectedIssue: string };
  review?: { rating: number; comment: string };
}

const SCENARIOS: RepairScenario[] = [
  {
    customerIdx: 0,
    deviceIdx: 0,
    flow: RepairRequestFlow.AI_CHAT,
    finalStatus: RepairRequestStatus.AI_ASSESSING,
    issueText: 'Screen flickers randomly and battery drains fast.',
  },
  {
    customerIdx: 1,
    deviceIdx: 1,
    flow: RepairRequestFlow.DIRECT,
    finalStatus: RepairRequestStatus.PENDING_BRAND_SELECTION,
    issueText: 'Laptop keyboard backlight stopped working.',
  },
  {
    customerIdx: 2,
    deviceIdx: 2,
    flow: RepairRequestFlow.AI_CHAT,
    finalStatus: RepairRequestStatus.PENDING_OFFERS,
    issueText: 'Phone screen has a hairline crack after a drop.',
  },
  {
    customerIdx: 0,
    deviceIdx: 0,
    flow: RepairRequestFlow.DIRECT,
    finalStatus: RepairRequestStatus.OFFER_SELECTED,
    issueText: 'Phone camera lens is cracked.',
    offer: { inspectionPrice: 100, finalPrice: 850, expectedIssue: 'Camera lens replacement' },
  },
  {
    customerIdx: 1,
    deviceIdx: 1,
    flow: RepairRequestFlow.DIRECT,
    finalStatus: RepairRequestStatus.INSPECTION_PENDING,
    issueText: 'Laptop overheats and shuts down under load.',
    offer: { inspectionPrice: 150, finalPrice: 1200, expectedIssue: 'Fan and thermal paste replacement' },
  },
  {
    customerIdx: 2,
    deviceIdx: 2,
    flow: RepairRequestFlow.AI_CHAT,
    finalStatus: RepairRequestStatus.INSPECTION_DONE,
    issueText: 'Phone charging port is loose.',
    offer: { inspectionPrice: 80, finalPrice: 400, expectedIssue: 'Charging port replacement' },
  },
  {
    customerIdx: 0,
    deviceIdx: 0,
    flow: RepairRequestFlow.DIRECT,
    finalStatus: RepairRequestStatus.PAYMENT_DONE,
    issueText: 'Phone battery swollen, needs replacement.',
    offer: { inspectionPrice: 100, finalPrice: 700, expectedIssue: 'Battery replacement' },
  },
  {
    customerIdx: 1,
    deviceIdx: 1,
    flow: RepairRequestFlow.DIRECT,
    finalStatus: RepairRequestStatus.COMPLETED,
    issueText: 'Laptop trackpad is unresponsive.',
    offer: { inspectionPrice: 100, finalPrice: 600, expectedIssue: 'Trackpad replacement' },
    review: { rating: 5, comment: 'Fast and professional service, highly recommend!' },
  },
  {
    customerIdx: 2,
    deviceIdx: 2,
    flow: RepairRequestFlow.AI_CHAT,
    finalStatus: RepairRequestStatus.CANCELLED,
    issueText: 'Phone not turning on at all.',
  },
];

async function seedRepairRequests(
  customers: ICustomerDB[],
  devices: IDeviceDB[],
  brand: IBrandDB,
): Promise<void> {
  const existingCount = await RepairRequestModel.countDocuments();
  if (existingCount > 0) {
    log.info('[seed] repair requests already exist, skipping');
    return;
  }

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  let walletBalance = brand.walletBalance ?? 0;

  for (const scenario of SCENARIOS) {
    const statusSequence =
      scenario.finalStatus === RepairRequestStatus.CANCELLED
        ? [RepairRequestStatus.AI_ASSESSING, RepairRequestStatus.CANCELLED]
        : STATUS_ORDER.slice(0, STATUS_ORDER.indexOf(scenario.finalStatus) + 1);

    const statusLogs = statusSequence.map((status, idx) => ({
      status,
      timestamp: new Date(now - (statusSequence.length - idx) * day),
    }));

    const finalIdx = STATUS_ORDER.indexOf(scenario.finalStatus);
    const customer = customers[scenario.customerIdx]!;
    const device = devices[scenario.deviceIdx]!;

    const repairRequest = await RepairRequestModel.create({
      customerId: customer._id,
      deviceId: device._id,
      issueText: scenario.issueText,
      flow: scenario.flow,
      status: scenario.finalStatus,
      aiReport:
        scenario.flow === RepairRequestFlow.AI_CHAT && statusSequence.length > 2
          ? ['Battery health degraded below 80%.', 'Recommend in-person inspection before repair.']
          : [],
      assignedBrandIds: statusSequence.length > 1 ? [brand._id] : [],
    });

    // Replace the single status log the pre-save hook generated on creation
    // with the full realistic history, and back-date created/updated timestamps.
    await RepairRequestModel.updateOne(
      { _id: repairRequest._id },
      {
        $set: {
          statusLogs,
          createdAt: statusLogs[0]!.timestamp,
          updatedAt: statusLogs[statusLogs.length - 1]!.timestamp,
        },
      },
    );

    if (!scenario.offer || finalIdx < OFFER_SELECTED_IDX) continue;

    const offer = await BrandOfferModel.create({
      repairRequestId: repairRequest._id,
      brandId: brand._id,
      branchIndex: 0,
      offerItems: [
        {
          expectedIssue: scenario.offer.expectedIssue,
          priceRange: { min: scenario.offer.finalPrice - 100, max: scenario.offer.finalPrice + 100 },
          expectedFinishDate: new Date(now + 3 * day),
        },
      ],
      distanceKm: 4.2,
      inspectionPrice: scenario.offer.inspectionPrice,
      status: BrandOfferStatus.ACCEPTED,
    });
    await RepairRequestModel.updateOne({ _id: repairRequest._id }, { $set: { selectedOfferId: offer._id } });

    if (finalIdx < INSPECTION_DONE_IDX) continue;

    await InspectionModel.create({
      repairRequestId: repairRequest._id,
      brandOfferId: offer._id,
      brandId: brand._id,
      customerId: customer._id,
      resultNotes: `Confirmed issue: ${scenario.offer.expectedIssue}.`,
      finalPrice: scenario.offer.finalPrice,
      images: [],
    });

    if (finalIdx < PAYMENT_DONE_IDX) continue;

    const categoryId = device.categoryId;
    const commissionAmount = Math.round(scenario.offer.finalPrice * 0.1);
    const brandNet = scenario.offer.finalPrice - commissionAmount;

    await PaymentModel.create({
      repairRequestId: repairRequest._id,
      customerId: customer._id,
      brandId: brand._id,
      categoryId,
      type: PaymentType.INSPECTION,
      method: PaymentMethod.CASH,
      amount: scenario.offer.inspectionPrice,
      commissionAmount: 0,
      brandNet: scenario.offer.inspectionPrice,
      status: PaymentStatus.PAID,
      paidAt: statusLogs[0]!.timestamp,
    });

    const finalPayment = await PaymentModel.create({
      repairRequestId: repairRequest._id,
      customerId: customer._id,
      brandId: brand._id,
      categoryId,
      type: PaymentType.FINAL,
      method: PaymentMethod.ONLINE,
      amount: scenario.offer.finalPrice,
      commissionAmount,
      brandNet,
      status: PaymentStatus.PAID,
      paidAt: statusLogs[statusLogs.length - 1]!.timestamp,
    });

    // Online payment: platform held the funds, credit the brand wallet with brandNet.
    walletBalance += brandNet;
    await BrandWalletTransactionModel.create({
      brandId: brand._id,
      type: WalletTransactionType.BOOKING_ONLINE,
      direction: WalletTransactionDirection.CREDIT,
      amount: brandNet,
      balanceAfter: walletBalance,
      paymentId: finalPayment._id,
      repairRequestId: repairRequest._id,
      note: `Online final payment for repair request ${repairRequest._id}.`,
    });
    await BrandModel.updateOne({ _id: brand._id }, { $set: { walletBalance } });

    if (!scenario.review || scenario.finalStatus !== RepairRequestStatus.COMPLETED) continue;

    await BrandReviewModel.create({
      customerId: customer._id,
      brandId: brand._id,
      repairRequestId: repairRequest._id,
      rating: scenario.review.rating,
      comment: scenario.review.comment,
    });

    await BrandModel.updateOne(
      { _id: brand._id },
      {
        $inc: { completedRepairs: 1, ratingCount: 1 },
        $set: { rating: scenario.review.rating },
      },
    );

    log.info(`[seed] created repair request lifecycle up to ${scenario.finalStatus}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Payouts — brand wallet withdrawals reviewed by admins
// ─────────────────────────────────────────────────────────────────────────────

async function seedPayouts(brandsAndProviders: BrandAndProvider[], admins: IAdminDB[]): Promise<void> {
  const existingCount = await BrandPayoutModel.countDocuments();
  if (existingCount > 0) {
    log.info('[seed] payouts already exist, skipping');
    return;
  }

  const [techfix, quickfix, procare] = brandsAndProviders;
  const reviewingAdmin = admins[0]!;

  if (techfix) {
    const brand = await BrandModel.findById(techfix.brand._id);
    if (brand && brand.walletBalance > 0) {
      const sentAmount = Math.max(1, Math.min(300, Math.floor(brand.walletBalance * 0.6)));

      const sentPayout = await BrandPayoutModel.create({
        brandId: brand._id,
        requestedBy: techfix.provider._id,
        amount: sentAmount,
        method: PayoutMethod.BANK,
        status: PayoutStatus.SENT,
        bankDestination: {
          bankName: 'CIB',
          accountHolderName: techfix.provider.name,
          iban: 'EG1234567890123456789012345',
          accountNumber: null,
          swiftCode: 'CIBEEGCX',
        },
        processedBy: reviewingAdmin._id,
        processedAt: new Date(),
        adminNote: 'Transferred via bank wire, ref #882319.',
      });

      const balanceAfterPayout = brand.walletBalance - sentAmount;
      await BrandWalletTransactionModel.create({
        brandId: brand._id,
        type: WalletTransactionType.PAYOUT_SENT,
        direction: WalletTransactionDirection.DEBIT,
        amount: sentAmount,
        balanceAfter: balanceAfterPayout,
        payoutId: sentPayout._id,
        note: `Payout sent via bank transfer (#${sentPayout._id}).`,
      });
      await BrandModel.updateOne({ _id: brand._id }, { $set: { walletBalance: balanceAfterPayout } });

      const pendingAmount = Math.max(1, Math.floor(balanceAfterPayout * 0.5));
      if (pendingAmount > 0) {
        await BrandPayoutModel.create({
          brandId: brand._id,
          requestedBy: techfix.provider._id,
          amount: pendingAmount,
          method: PayoutMethod.INSTAPAY,
          status: PayoutStatus.PENDING,
          instapayDestination: { identifier: TEST_PHONE, accountHolderName: techfix.provider.name },
        });
      }

      log.info('[seed] created TechFix Egypt payouts (sent + pending)');
    }
  }

  if (quickfix) {
    await BrandPayoutModel.create({
      brandId: quickfix.brand._id,
      requestedBy: quickfix.provider._id,
      amount: 250,
      method: PayoutMethod.WALLET,
      status: PayoutStatus.REJECTED,
      walletDestination: {
        walletProvider: 'vodafone_cash',
        phoneNumber: quickfix.provider.phoneNumber,
        accountHolderName: quickfix.provider.name,
      },
      processedBy: reviewingAdmin._id,
      processedAt: new Date(),
      adminNote: 'Insufficient verified wallet balance at time of request.',
    });
    log.info('[seed] created QuickFix Mobile rejected payout');
  }

  if (procare) {
    await BrandPayoutModel.create({
      brandId: procare.brand._id,
      requestedBy: procare.provider._id,
      amount: 150,
      method: PayoutMethod.BANK,
      status: PayoutStatus.PENDING,
      bankDestination: {
        bankName: 'NBE',
        accountHolderName: procare.provider.name,
        iban: 'EG1234567890123456789054321',
        accountNumber: null,
        swiftCode: null,
      },
    });
    log.info('[seed] created ProCare Electronics pending payout');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reels — one real video, cloned across multiple reel documents per brand
// ─────────────────────────────────────────────────────────────────────────────

const REEL_DEFS = [
  { caption: { en: 'Cracked screen? We fix it in under an hour!', ar: 'شاشة مكسورة؟ نصلحها في أقل من ساعة!' }, tags: ['screen', 'fast'], baseViews: 1200 },
  { caption: { en: 'Watch us safely replace a swollen battery.', ar: 'شاهدنا نستبدل بطارية منتفخة بأمان.' }, tags: ['battery', 'safety'], baseViews: 3400 },
  { caption: { en: 'Laptop running hot? Our deep-clean fixes it.', ar: 'اللابتوب سخن؟ التنظيف العميق يحل المشكلة.' }, tags: ['laptop', 'cooling'], baseViews: 850 },
  { caption: { en: 'Same-day phone charging port repair.', ar: 'إصلاح منفذ شحن الهاتف في نفس اليوم.' }, tags: ['phone', 'charging'], baseViews: 2100 },
  { caption: { en: 'Behind the scenes at one of our branches.', ar: 'خلف الكواليس في أحد فروعنا.' }, tags: ['behindthescenes'], baseViews: 4300 },
  { caption: { en: '5 signs your phone battery needs replacing.', ar: '5 علامات تدل على ضرورة تغيير بطارية هاتفك.' }, tags: ['tips', 'battery'], baseViews: 6200 },
  { caption: { en: 'Customer review: 5 stars for our quick service!', ar: 'تقييم عميل: 5 نجوم لخدمتنا السريعة!' }, tags: ['review'], baseViews: 990 },
  { caption: { en: 'How we diagnose a cracked camera lens.', ar: 'كيف نقوم بتشخيص عدسة كاميرا مكسورة.' }, tags: ['diagnosis', 'camera'], baseViews: 1750 },
];

async function seedReels(brandsAndProviders: BrandAndProvider[], customers: ICustomerDB[]): Promise<void> {
  const existingCount = await ReelModel.countDocuments();
  if (existingCount > 0) {
    log.info('[seed] reels already exist, skipping');
    return;
  }

  const videoKey = 'seed/reel-demo.mp4';
  const thumbnailKey = 'seed/reel-demo.jpg';

  const videoBuffer = await fetchBuffer('https://www.w3schools.com/html/mov_bbb.mp4');
  await uploadFile(videoBuffer, videoKey, 'video/mp4');

  const thumbnailBuffer = await fetchBuffer('https://picsum.photos/seed/revia-reel/640/360.jpg');
  await uploadFile(thumbnailBuffer, thumbnailKey, 'image/jpeg');

  for (let i = 0; i < REEL_DEFS.length; i++) {
    const def = REEL_DEFS[i]!;
    const brand = brandsAndProviders[i % brandsAndProviders.length]!.brand;

    const reel = await ReelModel.create({
      brand: brand._id,
      video: videoKey,
      thumbnail: thumbnailKey,
      caption: def.caption,
      tags: def.tags,
      viewsCount: def.baseViews + Math.floor(Math.random() * 500),
      isVisible: true,
    });

    const likers = customers.filter(() => Math.random() > 0.4);
    for (const customer of likers) {
      await ReelLikeModel.create({ reel: reel._id, customer: customer._id });
    }
    await ReelModel.updateOne({ _id: reel._id }, { $set: { likesCount: likers.length } });
  }

  log.info(`[seed] created ${REEL_DEFS.length} reels (one cloned video) across ${brandsAndProviders.length} brands`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription config + per-brand subscriptions
// ─────────────────────────────────────────────────────────────────────────────

const SUBSCRIPTION_PRICE_EGP = 0;
const SUBSCRIPTION_DURATION_DAYS = 7;

async function seedSubscriptionConfig(admin: IAdminDB): Promise<void> {
  await BrandSubscriptionConfigModel.findOneAndUpdate(
    {},
    { priceEGP: SUBSCRIPTION_PRICE_EGP, durationDays: SUBSCRIPTION_DURATION_DAYS, updatedBy: admin._id },
    { upsert: true },
  );
  log.info(`[seed] set subscription config to ${SUBSCRIPTION_PRICE_EGP} EGP / ${SUBSCRIPTION_DURATION_DAYS} days`);
}

async function seedBrandSubscriptions(brandsAndProviders: BrandAndProvider[], admin: IAdminDB): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  for (const { brand } of brandsAndProviders) {
    const existing = await BrandSubscriptionModel.findOne({ brandId: brand._id });
    if (existing) continue;

    await BrandSubscriptionModel.create({
      brandId: brand._id,
      status: SubscriptionStatus.ACTIVE,
      price: SUBSCRIPTION_PRICE_EGP,
      durationDays: SUBSCRIPTION_DURATION_DAYS,
      activatedAt: now,
      expiresAt,
      markedPaidBy: admin._id,
    });
    log.info(`[seed] created active subscription for ${brand.name.en}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Support tickets
// ─────────────────────────────────────────────────────────────────────────────

async function seedSupportTickets(
  customers: ICustomerDB[],
  brandsAndProviders: BrandAndProvider[],
): Promise<void> {
  const existingCount = await SupportTicketModel.countDocuments();
  if (existingCount > 0) {
    log.info('[seed] support tickets already exist, skipping');
    return;
  }

  const [techfix, quickfix, procare] = brandsAndProviders;

  await SupportTicketModel.create([
    {
      senderType: SupportTicketSenderType.CUSTOMER,
      customerId: customers[0]!._id,
      subject: 'Repair request stuck on payment',
      message: 'I paid the inspection fee but the request status has not updated for two days.',
      status: SupportTicketStatus.OPEN,
      priority: SupportTicketPriority.HIGH,
    },
    {
      senderType: SupportTicketSenderType.CUSTOMER,
      customerId: customers[1]!._id,
      subject: 'App crashes when uploading photo',
      message: 'The app closes every time I try to attach a photo to my repair request.',
      status: SupportTicketStatus.IN_PROGRESS,
      priority: SupportTicketPriority.MEDIUM,
      adminNote: 'Forwarded to the dev team for investigation.',
    },
    {
      senderType: SupportTicketSenderType.CUSTOMER,
      customerId: customers[2]!._id,
      subject: 'Refund request for cancelled repair',
      message: 'My repair request was cancelled, please refund the inspection fee I already paid.',
      status: SupportTicketStatus.RESOLVED,
      priority: SupportTicketPriority.MEDIUM,
      adminNote: 'Refund processed manually on 2026-06-15.',
    },
    {
      senderType: SupportTicketSenderType.BRAND,
      brandId: techfix!.brand._id,
      subject: 'Need help understanding commission breakdown',
      message: 'Could someone explain how the commission is calculated on online payments?',
      status: SupportTicketStatus.CLOSED,
      priority: SupportTicketPriority.LOW,
      adminNote: 'Explained via phone call, brand confirmed it is clear now.',
    },
    {
      senderType: SupportTicketSenderType.BRAND,
      brandId: quickfix!.brand._id,
      subject: 'Payout request rejected, need clarification',
      message: 'Our InstaPay payout was rejected, what additional information do you need from us?',
      status: SupportTicketStatus.OPEN,
      priority: SupportTicketPriority.HIGH,
    },
    {
      senderType: SupportTicketSenderType.BRAND,
      brandId: procare!.brand._id,
      subject: 'How to add a new branch location?',
      message: 'We opened a new branch in Mansoura, how do we add it to our brand profile?',
      status: SupportTicketStatus.IN_PROGRESS,
      priority: SupportTicketPriority.LOW,
    },
  ]);

  log.info('[seed] created 6 support tickets');
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  await initDB();
  log.info('[seed] starting...');

  const admins = await seedAdmins();
  const categories = await seedCategories();
  const brandsAndProviders = await seedBrandsAndProviders(categories);
  const customers = await seedCustomers();
  const devices = await seedDevices(customers, categories);
  await seedRepairRequests(customers, devices, brandsAndProviders[0]!.brand);
  await seedPayouts(brandsAndProviders, admins);
  await seedReels(brandsAndProviders, customers);
  await seedSubscriptionConfig(admins[0]!);
  await seedBrandSubscriptions(brandsAndProviders, admins[0]!);
  await seedSupportTickets(customers, brandsAndProviders);

  log.info('[seed] finished.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  log.error(`[seed] failed: ${err instanceof Error ? err.stack : err}`);
  process.exit(1);
});
