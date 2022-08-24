// simulate getting products from DataBase
const products = [
  { name: "Apples",   country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges",  country: "Spain", cost: 4, instock: 3 },
  { name: "Beans",    country: "USA",   cost: 2, instock: 5 },
  { name: "Cabbage",  country: "USA",   cost: 1, instock: 8 },
];

//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    CloseButton,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    console.log(`add to Cart ${JSON.stringify(item)}`);
    setCart([...cart, ...item]);
    //doFetch(query);
  };
  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
  };
  const photos = ["./images/apple.png", "./images/orange.png", "./images/beans.png", "./images/cabbage.png"];

  let list = items.map((item, index) => {
    //let n = index + 1049;
    //let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <Container key={index}>
        <Row>
            <Image style={{ 
              padding: "0.50rem 0 0.50rem 0",
              borderRadius: "50%" }} 
              src={photos[index % 4]} 
              width={60} 
              height={70}    
            >
            </Image>
            <Card.Header style={{ 
              background: "#F2F2F2", 
              color: "#2c3e50" , 
              width: "10rem",
              borderRadius: "10px",
              margin:"0.15rem 0 0.15rem 0.25rem" }}
            >
              <strong>{item.name}</strong>: ${item.cost}
              <br />
              <input style={{ 
              backgroundColor: "#50C594", 
              border: "none",
              color: "white",
              borderRadius: "5px" }} 
              name={item.name} 
              type="submit" 
              onClick={addToCart}
              >
              </input>
            </Card.Header>
        </Row>
      </Container>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header style={{backgroundColor: "#E0F7EB"}}>
          <Accordion.Toggle as={Button} variant="link" style={{color: "#2c3e50"}} eventKey={1 + index}>
            <strong>{item.name}</strong> (1 piece)
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
            $ {item.cost} from {item.country} 
            <CloseButton />
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.data.map((item) => {
      let { name, country, cost, instock } = item.attributes;
      return { name, country, cost, instock };
    });
    setItems([...items, ...newItems]);
  };

  return (
    <Container style={{
      backgroundColor: "linear-gradient(to right, #c9d6ff, #e2e2e2)", 
      border: "none"}}
    >
      <h1 style={{ 
        color: "#50C594", 
        marginTop: "2rem" }}
      >
        <strong>React Shopping Cart</strong>
      </h1>
      <h4 style={{ color: "#2c3e50" }}>See how we restock products!</h4>
      <Row style={{ marginTop: "2rem"}}>
        <Col>
          <h2 style={{ color: "#2c3e50" }}>Product List</h2>
          <hr />
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h2 style={{ color: "#2c3e50" }}>Cart Contents</h2>
          <hr />
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h2 style={{ color: "#2c3e50" }}>CheckOut </h2>
          <hr />
          <Button style={{
            backgroundColor: "#50C594", 
            border: "none"}} 
            onClick={checkOut}
          >
            CheckOut $ {finalList().total}
          </Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <hr/>
      <Row>
        <Col>
          <form
            onSubmit={(event) => {
              restockProducts(`http://localhost:1337/api/${query}`);
              console.log(`Restock called on ${query}`);
              event.preventDefault();
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button style={{ 
              backgroundColor: "#50C594", 
              border: "none", 
              marginLeft: "0.25rem", 
              marginBottom: "0.25rem" }} 
              type="submit"
            >
              ReStock Products
            </Button>
          </form>
        </Col>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
