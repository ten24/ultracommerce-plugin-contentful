
// import identity from 'lodash/identity';
// import difference from 'lodash/difference';
// import get from 'lodash/get';
// import Client from 'shopify-buy';
// import makePagination from './Pagination';
import * as SlatwalSDK from '@slatwall/slatwall-sdk'

import { validateParameters } from '.';
import makePagination from './Pagination';
// import { previewsToVariants } from './dataTransformer';

export const fetchProductPreviews = async (skus, config) => {
    let newProducts = []
    if (!skus.length) {
        return [];
    }
    const PREVIEWS_PER_PAGE = 25;
    const { storefrontAccessToken, apiEndpoint } = config;
    var slatwall = SlatwalSDK.init({ host: 'https://slatwall.mitrahsoft.co.in/' });
    var loginCredentials = { emailAddress: "sankar.a@mitrahsoft.com", password: "12345678" };
    var bearerToken = '';
    //Login

    slatwall.auth.login(loginCredentials).then(function (response) {
        if (response.isFail()) {
            //show errors
            console.error("Error", response.fail());
        } else {
            bearerToken = { bearerToken: response.success().token };
        }
    });


    slatwall.products.list(bearerToken, {
        perPage: 20,
        page: 1,
    }).then(function (response) {
        console.log('productResponse', response);
    });


    // let init = {
    //     hostname: 'slatwall.mitrahsoft.co.in',
    //     AccessKey: 'B44ACE4E36B498BFCE066FD5CF2881C5C540F570',
    //     AccessKeySecret: 'ODM0MjQ4REVBNDY1ODY4REJCNTY1MkJCRDZGOTQzQUVDMDg2NEZCMw=='
    // }
    // const slatwall1 = require("./Slatwall/slatwall")(init)
    // var res = slatwall1.products.get()
    // await res.then(resp => {
    //     newProducts = JSON.parse(resp).pageRecords
    // })
    // console.log('newProducts', newProducts)
    return [{
        id: '1',
        image: 'https://images-na.ssl-images-amazon.com/images/I/71ZIrJ6XLLL._SL1500_.jpg',
        // TODO: Remove sku:id when @contentful/ecommerce-app-base supports internal IDs
        // as an alternative piece of info to persist instead of the SKU.
        // For now this is a temporary hack.
        sku: '45',
        productId: '123',
        name: 'Watch',
    }]

};

export const makeProductSearchResolver = async sdk => {
    const pagination = await makePagination(sdk);
    return search => pagination.fetchProductPreviews(search);
};