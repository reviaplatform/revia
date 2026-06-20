import { Query, Document } from 'mongoose';

interface QueryString {
  [key: string]: any;
}

export class ApiFeatures<T extends Document, U = T> {
  public dbQuery: Query<U[], U>;
  private queryString: QueryString;

  constructor(dbQuery: Query<U[], U>, queryString: QueryString) {
    this.dbQuery = dbQuery;
    this.queryString = queryString;
  }

  public filter(): this {
    const queryStringObj: QueryString = { ...this.queryString };

    const excludesFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'profile',
      'data',
      'keyword',
      'createdAt',
      'lang',
      'deletedAt',
      '_id',
      'withoutBrandData',
      'active',
      'startDate',
      'endDate',
      'birthdayMonth',
      'birthdayDay'
    ];

    excludesFields.forEach(field => delete queryStringObj[field]);

    const queryStr = JSON.stringify(queryStringObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`,
    );

    this.dbQuery = this.dbQuery.find(JSON.parse(queryStr));

    // Handle birthday filtering
    if (this.queryString.birthdayMonth || this.queryString.birthdayDay) {
      const birthdayFilter: any = {};
      
      if (this.queryString.birthdayMonth && this.queryString.birthdayDay) {
        // Filter by specific month and day
        const month = this.queryString.birthdayMonth;
        const day = this.queryString.birthdayDay;
        birthdayFilter.birthday = { $regex: `^${day}:${month}:` };
      } else if (this.queryString.birthdayMonth) {
        // Filter by month only
        const month = this.queryString.birthdayMonth;
        birthdayFilter.birthday = { $regex: `:${month}:` };
      } else if (this.queryString.birthdayDay) {
        // Filter by day only
        const day = this.queryString.birthdayDay;
        birthdayFilter.birthday = { $regex: `^${day}:` };
      }
      
      this.dbQuery = this.dbQuery.find(birthdayFilter);
    }

    return this;
  }

  public sort(): this {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(',').join(' ')
      : '-createdAt';

    this.dbQuery = this.dbQuery.sort(sortBy);
    return this;
  }

  public paginate(): this {
    const page = parseInt(this.queryString.page || '1', 10);
    const limit = parseInt(this.queryString.limit || '25', 10);
    const skip = (page - 1) * limit;

    this.dbQuery = this.dbQuery.skip(skip).limit(limit);
    return this;
  }

  public searchAccounts(): this {
    if (this.queryString.keyword) {
      const regexPattern = new RegExp(this.queryString.keyword, 'i');

      const searchFields = [
        { name: regexPattern },
        { email: regexPattern },
        { phoneNumber: regexPattern },
      ];

      this.dbQuery = this.dbQuery.find({ $or: searchFields });
    }

    return this;
  }

  public searchBrand(): this {
    if (this.queryString.keyword) {
      const regexPattern = new RegExp(this.queryString.keyword, 'i');

      const searchFields = [{ 'name.en': regexPattern }, { 'name.ar': regexPattern }, { crn: regexPattern }, { tin: regexPattern }];

      this.dbQuery = this.dbQuery.find({ $or: searchFields });
    }

    return this;
  }

  public searchBrandMedia(): this {
    if (this.queryString.keyword) {
      const regexPattern = new RegExp(this.queryString.keyword, 'i');

      const searchFields = [{ caption: regexPattern }];

      this.dbQuery = this.dbQuery.find({ $or: searchFields });
    }

    return this;
  }

  public searchCoupon(): this {
    if (this.queryString.keyword) {
      const regexPattern = new RegExp(this.queryString.keyword, 'i');

      const searchFields = [{ code: regexPattern }];

      this.dbQuery = this.dbQuery.find({ $or: searchFields });
    }

    return this;
  }

  public searchProviderRequest(): this {
    if (this.queryString.keyword) {
      const regexPattern = new RegExp(this.queryString.keyword, 'i');

      const searchFields = [
        { providerName: regexPattern },
        { providerPhone: regexPattern },
        { brandName: regexPattern },
        { brandLocation: regexPattern },
        { salesPerson: regexPattern },
      ];

      this.dbQuery = this.dbQuery.find({ $or: searchFields });
    }

    return this;
  }

  public searchTicket(): this {
    if (this.queryString.keyword) {
      const regexPattern = new RegExp(this.queryString.keyword, 'i');

      const searchFields = [{ title: regexPattern }, { description: regexPattern }];

      this.dbQuery = this.dbQuery.find({ $or: searchFields });
    }

    return this;
  }
}
