import React, { useEffect, useState } from "react";
import "./style/App.scss";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { getInfo, getOrder, selectShopStatus } from "../state/shopSlice";

import Browse from "./view/browse/Browse";
import Order from "./view/order/Order";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";

// <Browse disabled={false} />

function App() {
    const [activeTab, setActiveTab] = useState("1");

    const status = useAppSelector(selectShopStatus);
    const dispatch = useAppDispatch();
    const disabled = status === "waiting";

    function toggle(tab: string) {
        if (activeTab !== tab) {
            setActiveTab(tab);
            console.log("haha");
        }
    }

    // componentDidMount
    useEffect(() => {
        dispatch(getInfo()).catch((e) => {
            throw e;
        });
    }, []);

    return (
        <div className="App">
            <Nav tabs>
                <NavItem>
                    <NavLink
                        disabled={disabled}
                        className={classnames({ active: activeTab === "1" })}
                        onClick={function noRefCheck() {
                            toggle("1");
                        }}
                    >
                        Product Listing
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        disabled={disabled}
                        className={classnames({ active: activeTab === "2" })}
                        onClick={function noRefCheck() {
                            toggle("2");
                            dispatch(getOrder()).catch((e) => {
                                throw e;
                            });
                        }}
                    >
                        Order History
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    <Browse disabled={disabled} />
                </TabPane>
                <TabPane tabId="2">
                    <Order disabled={disabled} />
                </TabPane>
            </TabContent>
        </div>
    );
}

export default App;
