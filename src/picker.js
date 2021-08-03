import { useEffect, useState } from "react";
import { mapSort } from "./utils";
import get from "lodash/get";
import {
  Button,
  TextInput,
  Icon,
  Card,
  Typography,
  Paragraph,
  Heading,
  Subheading,
  Checkbox,
  Asset,
} from "@contentful/forma-36-react-components";
import preloadData from "./preload";
import Slider from "react-slick";
const SlatwalSDK = require("@slatwall/slatwall-sdk/dist/client/index");

const ProductsPicker = ({ validateParameters, sdk, fetchProductPreviews }) => {
  const { apiEndpoint } = sdk.parameters.installation;
  const SlatwalApiService = SlatwalSDK.init({
    host: apiEndpoint,
  });
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSKUs, setSelectedSKUs] = useState(
    get(sdk, ["parameters", "invocation", "fieldValue"], [])
  );
  const [productTypes, setProductTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedProdType, setSelectedProdType] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);

  useEffect(() => {
    getProductTypes();
    getCategories();
    getBrands();
  }, []);

  const getProductTypes = async () => {
    let productTypes = await getAPI("producttype");
    let sortedProductTypes = productTypes.sort((a, b) =>
      a.productTypeName.localeCompare(b.productTypeName)
    );
    setProductTypes(sortedProductTypes);
  };
  const getCategories = async () => {
    let categoryData = await getAPI("category");
    let sortedCategory = categoryData.sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    );
    setCategories(sortedCategory);
  };

  const getBrands = async () => {
    let brandData = await getAPI("brand");
    let sortedBrands = brandData.sort((a, b) =>
      a.brandName.localeCompare(b.brandName)
    );
    setBrands(sortedBrands);
  };

  const getAPI = (entity) => {
    let payload = {
      entityName: entity,
      includeAttributesMetadata: true,
    };
    return SlatwalApiService.general.getEntity(payload).then((response) => {
      if (
        response.isSuccess() &&
        response.success().data &&
        response.success().data.pageRecords
      ) {
        return response.success().data.pageRecords;
      } else {
        sdk.notifier.error("There was an error fetching the data.");
      }
    });
  };

  const getURL = () => {
    // if I send key with empty value it doesn't return any data. So I have splitted like below
    let payload = {
      entityName: "product",
      includeAttributesMetadata: true,
      "p:current": pageNumber,
      "p:show": preloadData.PREVIEWS_PER_PAGE,
      "f:productName:like": searchValue,
    };
    if (selectedProdType && selectedCategory.length === 0) {
      payload = {
        ...payload,
        "f:productType.productTypeIDPath:like": selectedProdType
          .map((data) => data)
          .join(","),
        "f:brand.brandID:like": selectedBrand.map((data) => data).join(","),
      };
    } else if (selectedCategory && selectedProdType.length === 0) {
      payload = {
        ...payload,
        "f:categories.categoryID:eq": selectedCategory
          .map((data) => data)
          .join(","),
        "f:brand.brandID:like": selectedBrand.map((data) => data).join(","),
      };
    } else {
      payload = {
        ...payload,
        "f:productType.productTypeIDPath:like": selectedProdType
          .map((data) => data)
          .join(","),
        "f:categories.categoryID:eq": selectedCategory
          .map((data) => data)
          .join(","),
        "f:brand.brandID:like": selectedBrand.map((data) => data).join(","),
      };
    }

    return SlatwalApiService.general
      .getEntity(payload)
      .then((response) => {
        if (response.isSuccess() && response.success().data) {
          return response.success().data;
        } else {
          console.log("error");
        }
      })
      .catch((e) =>
        sdk.notifier.error(
          "There was an error fetching the data for the selected products."
        )
      );
  };

  useEffect(() => {
    // to get all products to show in the dialogue modal
    const fetchSKUs = async () => {
      const validationError = validateParameters(sdk.parameters.installation);
      if (validationError) {
        throw new Error(validationError);
      }
      let productsData = await getURL();
      setProducts(productsData);
    };
    fetchSKUs();
  }, [
    pageNumber,
    selectedProdType,
    selectedCategory,
    searchValue,
    selectedBrand,
  ]);

  useEffect(() => {
    const updateSelectedProducts = async () => {
      try {
        const config = sdk.parameters.installation;
        const selectedProductsUnsorted = await fetchProductPreviews(
          selectedSKUs,
          config
        );
        const selectedProducts = mapSort(
          selectedProductsUnsorted,
          selectedSKUs,
          "sku"
        );
        setSelectedProducts(selectedProducts);
      } catch (error) {
        sdk.notifier.error(
          "There was an error fetching the data for the selected products."
        );
      }
    };
    updateSelectedProducts();
  }, [selectedSKUs]);

  const selectProduct = (selectedProd) => {
    if (selectedSKUs.includes(selectedProd)) {
      setSelectedSKUs(selectedSKUs.filter((val) => val !== selectedProd));
    } else {
      setSelectedSKUs([...selectedSKUs, selectedProd]);
    }
  };
  const onClickSaveBtn = () => {
    sdk.close(selectedSKUs);
  };
  const selectCategory = (params) => {
    let arr = [];
    if (selectedCategory.includes(params)) {
      arr = selectedCategory.filter((data) => data !== params);
    } else {
      arr = [...selectedCategory, params];
    }
    setSelectedCategory(arr);
  };
  const selectProductType = (params) => {
    let arr = [];
    if (selectedProdType.includes(params)) {
      arr = selectedProdType.filter((data) => data !== params);
    } else {
      arr = [...selectedProdType, params];
    }
    setSelectedProdType(arr);
  };
  const selectBrand = (params) => {
    let arr = [];
    if (selectedBrand.includes(params)) {
      arr = selectedBrand.filter((data) => data !== params);
    } else {
      arr = [...selectedBrand, params];
    }
    setSelectedBrand(arr);
  };
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: selectedProducts.length > 7 ? 7 : selectedProducts.length,
    slidesToScroll: 1,
  };
  return (
    <div
      className="w-100 ms-2 mt-3 px-3"
      style={{
        height: 800,
      }}
    >
      <div className="d-flex flex-row justify-content-between align-items-center mb-5">
        <div>
          <TextInput
            placeholder="Search for a product..."
            type="search"
            name="sku-search"
            id="sku-search"
            testId="sku-search"
            width="medium"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <div className="pt-2 ps-1">{`Total results : ${products.length}`}</div>
        </div>
        <div className="justify-content-center width_60">
          <Slider {...settings}>
            {selectedProducts.length &&
              selectedProducts.map((val) => {
                return (
                  <div key={val.sku_skuID}>
                    <div
                      onClick={() => selectProduct(val.sku_skuID)}
                      className="d-flex justify-content-center"
                    >
                      <Icon color="muted" icon="Close" />
                    </div>
                    <Asset
                      src={val.image ? val.image : preloadData.placeHolderImage}
                      type="image"
                      style={{ height: "50px" }}
                    />
                  </div>
                );
              })}
          </Slider>
        </div>
        <Button
          buttonType="primary"
          onClick={onClickSaveBtn}
          disabled={selectedSKUs.length === 0}
        >
          {`Save ${selectedSKUs.length} Products`}
        </Button>
      </div>
      <div className="row mt-3">
        <div className="col-3">
          <div className="box-shadow-positive">
            <div>
              <Heading>Filter By</Heading>
            </div>
            <hr />
            <Subheading>Categories</Subheading>
            {categories.length > 0 &&
              categories.map((cat) => {
                return (
                  <div className="form-check p-1" key={cat.categoryID}>
                    <Checkbox
                      name="Category"
                      id={cat.categoryID}
                      value={cat.categoryID}
                      onChange={(e) => selectCategory(e.target.value)}
                    />
                    <label className="ps-2">{cat.categoryName}</label>
                  </div>
                );
              })}
            <div className="pt-3">
              <Subheading>Product Types</Subheading>
              {productTypes.length > 0 &&
                productTypes.map((ptype) => {
                  return (
                    <div className="form-check p-1" key={ptype.productTypeID}>
                      <Checkbox
                        name="Product Type"
                        id={ptype.productTypeIDPath}
                        value={ptype.productTypeIDPath}
                        onChange={(e) => selectProductType(e.target.value)}
                      />
                      <label className="ps-2">{ptype.productTypeName}</label>
                    </div>
                  );
                })}
            </div>
            <div className="pt-3">
              <Subheading>Brands</Subheading>
              {brands.length > 0 &&
                brands.map((brand) => {
                  return (
                    <div className="form-check p-1" key={brand.productTypeID}>
                      <Checkbox
                        name="Product Type"
                        id={brand.brandID}
                        value={brand.brandID}
                        onChange={(e) => selectBrand(e.target.value)}
                      />
                      <label className="ps-2">{brand.brandName}</label>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="col-9">
          <div className="row">
            {products.map((data) => {
              return (
                <div className="col-3 mb-4" key={data.productID}>
                  <Card
                    selected={selectedSKUs.includes(data.productID)}
                    title={data.productName}
                    className="h-100 bg-white"
                    onClick={() => selectProduct(data.productID)}
                  >
                    <Asset
                      src={
                        data.images.length
                          ? `${preloadData.imageURL}${data.images[1]}`
                          : preloadData.placeHolderImage
                      }
                      type="image"
                    />
                    <Typography>
                      <Heading>{data.productName}</Heading>
                      <div className="d-flex justify-content-between mt-2">
                        <p className="text-secondary">
                          {data.defaultSku_skuPrices_listPrice !== " " && (
                            <s>${data.defaultSku_skuPrices_listPrice}</s>
                          )}
                        </p>
                        {data.defaultSku_skuPrices_price !== " " && (
                          <Paragraph>
                            ${data.defaultSku_skuPrices_price}
                          </Paragraph>
                        )}
                      </div>
                    </Typography>
                  </Card>
                </div>
              );
            })}
          </div>
          <div>
            <nav
              className="d-flex justify-content-between pt-2"
              aria-label="Page navigation"
            >
              <ul className="mx-auto pagination">
                {pageNumber > 1 && (
                  <li className="page-item">
                    <div
                      className="page-link clickable"
                      aria-label="Previous"
                      onClick={(evt) => {
                        evt.preventDefault();
                        setPageNumber(pageNumber - 1);
                      }}
                    >
                      <span aria-hidden="true" className="me-1">
                        &laquo;
                      </span>
                      <span className="sr-only">Previous</span>
                    </div>
                  </li>
                )}
                {products.length > 0 && (
                  <li className="page-item" style={{ display: "flex" }}>
                    <span
                      style={{
                        color: "black",
                        padding: 5,
                      }}
                    >
                      {pageNumber}
                    </span>
                  </li>
                )}
                {products.length === preloadData.PREVIEWS_PER_PAGE && (
                  <li className="page-item">
                    <div
                      className="page-link clickable"
                      aria-label="Next"
                      onClick={(evt) => {
                        evt.preventDefault();
                        setPageNumber(pageNumber + 1);
                      }}
                    >
                      <span className="sr-only">Next</span>
                      <span aria-hidden="true" className="ms-1">
                        &raquo;
                      </span>
                    </div>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPicker;
