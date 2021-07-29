import { useEffect, useState } from "react";
import { mapSort } from "./utils";
import get from "lodash/get";
import { Button, TextInput, Icon } from "@contentful/forma-36-react-components";
import preloadData from "./preload";
import Slider from "react-slick";
const SlatwalSDK = require("@slatwall/slatwall-sdk/dist/client/index");
var axios = require("axios");

const ProductsPicker = ({ validateParameters, sdk, fetchProductPreviews }) => {
  const { apiEndpoint } = sdk.parameters.installation;
  const SlatwalApiService = SlatwalSDK.init({
    host: apiEndpoint,
  });
  const [products, setProducts] = useState([]);
  const [tempProducts, setTempProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSKUs, setSelectedSKUs] = useState(
    get(sdk, ["parameters", "invocation", "fieldValue"], [])
  );
  const [productTypes, setProductTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedProdType, setSelectedProdType] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [isHovered, setHover] = useState(false);

  useEffect(() => {
    getProductTypes();
    getCategories();
  }, []);

  useEffect(() => {
    fetchSKUs();
  }, [pageNumber, selectedProdType, selectedCategory]);

  useEffect(() => {
    updateSelectedProducts();
  }, [selectedSKUs]);

  const getProductTypes = async () => {
    var config = {
      method: "get",
      url: `${apiEndpoint}/api/public/producttype/`,
    };

    let res = await axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        sdk.notifier.error("There was an error fetching the product types.");
      });
    setProductTypes(res.data.pageRecords);
  };
  const getCategories = async () => {
    // console.log("SlatwalApiService", await SlatwalApiService.category.list());
    var config = {
      method: "get",
      url: `${apiEndpoint}/api/public/category/`,
    };

    let res = await axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        sdk.notifier.error("There was an error fetching the categories.");
      });
    setCategories(res.data.pageRecords);
  };

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

  const getURL = () => {
    if (selectedProdType.length === 0 && selectedCategory.length === 0) {
      return `${apiEndpoint}api/public/product/?p:current=${pageNumber}&p:show=${preloadData.PREVIEWS_PER_PAGE}`;
    } else if (selectedProdType && selectedCategory.length === 0) {
      return `${apiEndpoint}api/public/product/?f:productType.productTypeIDPath:like=${selectedProdType}&p:current=${pageNumber}&p:show=${preloadData.PREVIEWS_PER_PAGE}`;
    } else if (selectedCategory && selectedProdType.length === 0) {
      return `${apiEndpoint}api/public/product/?f:categories.categoryID:eq=${selectedCategory}&p:current=${pageNumber}&p:show=${preloadData.PREVIEWS_PER_PAGE}`;
    } else {
      return `${apiEndpoint}api/public/product/?f:productType.productTypeIDPath:like=${selectedProdType}&f:categories.categoryID:eq=${selectedCategory}&p:current=${pageNumber}&p:show=${preloadData.PREVIEWS_PER_PAGE}`;
    }
  };
  // to get all products to show in the dialogue modal
  const fetchSKUs = async () => {
    const validationError = validateParameters(sdk.parameters.installation);
    if (validationError) {
      throw new Error(validationError);
    }
    var config = {
      method: "get",
      url: getURL(),
    };

    let res = await axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });

    let filteredData = res.data;
    setProducts(filteredData);
    setTempProducts(filteredData);
  };

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
  const setSearch = (e) => {
    setSearchValue(e);
    let filteredData =
      tempProducts.length &&
      tempProducts.filter((values) =>
        values.productName.toLowerCase().includes(e.toLowerCase())
      );
    setProducts(filteredData);
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
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: selectedProducts.length > 7 ? 7 : selectedProducts.length,
    slidesToScroll: 1,
  };
  return (
    <div
      style={{
        height: 800,
        width: 1575,
        margin: "10px 0px 0px 10px",
        // display: "flex",
        // flexDirection: "column",
        // justifyContent: "center",
      }}
    >
      <div
        style={{
          justifyContent: "center",
          width: "50%",
          marginBottom: "36px",
          marginLeft: "30%",
        }}
      >
        <Slider {...settings}>
          {selectedProducts.length &&
            selectedProducts.map((val) => {
              return (
                <div
                  onMouseOver={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  key={val.sku_skuID}
                >
                  <img src={val.image} alt="Product1" height={50} />
                  {isHovered && (
                    <div
                      style={{
                        position: "absolute",
                        top: "23px",
                      }}
                      onClick={() => selectProduct(val.sku_skuID)}
                    >
                      <Icon color="muted" icon="Close" />
                    </div>
                  )}
                </div>
              );
            })}
        </Slider>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 5,
          paddingTop: 10,
          width: "100%",
        }}
      >
        <div>
          <TextInput
            placeholder="Search for a product..."
            type="search"
            name="sku-search"
            id="sku-search"
            testId="sku-search"
            width="medium"
            value={searchValue}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span>Total results:{products.length}</span>
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
        <div className="col-lg-3">
          <div
            className="bg-light"
            style={{ paddingLeft: "inherit", paddingRight: "inherit" }}
          >
            <div className="pt-3">
              <h5>Filter By</h5>
            </div>
            <hr />
            <h6>Categories</h6>
            {categories.length > 0 &&
              categories.map((cat) => {
                return (
                  <div style={{ padding: "3px" }} key={cat.categoryID}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="productType"
                        value={cat.categoryID}
                        onChange={(e) => selectCategory(e.target.value)}
                        style={{ marginRight: "7px" }}
                      />
                      <label className="form-check-label">
                        {cat.categoryName}
                      </label>
                      <br />
                    </div>
                  </div>
                );
              })}
            <div className="pt-3">
              <h6>Product Types</h6>
              {productTypes.length > 0 &&
                productTypes.map((ptype) => {
                  return (
                    <div style={{ padding: "3px" }} key={ptype.productTypeID}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="productType"
                          value={ptype.productTypeIDPath}
                          style={{ marginRight: "7px" }}
                          onChange={(e) => selectProductType(e.target.value)}
                        />
                        <label className="form-check-label">
                          {ptype.productTypeName}
                        </label>
                        <br />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="col-lg-8" style={{ marginLeft: "35px" }}>
          <div className="row">
            {products.map((data) => {
              return (
                <div className="col-lg-4 col-md-6 mb-4" key={data.productID}>
                  <div
                    className={`card ${
                      selectedSKUs.includes(data.productID)
                        ? "border-primary border-2"
                        : "border-secondary"
                    }`}
                    style={{ height: 450 }}
                    onClick={() => selectProduct(data.productID)}
                  >
                    <img
                      src={`${preloadData.imageURL}${data.images[1]}`}
                      className="img-fluid"
                      alt="Product1"
                    />
                    <div className="card-body">
                      <h5>{data.productName}</h5>
                      <div className="d-flex justify-content-between mt-3">
                        <p className="text-secondary">
                          <s>{data.defaultSku_skuPrices_listPrice}</s>
                        </p>
                        <p>{data.defaultSku_skuPrices_price}</p>
                      </div>
                    </div>
                  </div>
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
                  <li className="page-item">
                    <span
                      style={{
                        color: "black",
                        position: "relative",
                        display: "blockrelative",
                        border: "1px solid #dee2e6relative",
                        padding: 5,
                        textDecoration: "none",
                        backgroundColor: "#fff",
                        borderTopRightRadius: "0.25rem",
                        borderBottomRightRadius: "0.25rem",
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
