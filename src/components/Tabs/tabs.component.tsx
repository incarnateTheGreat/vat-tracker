import React, { useState, useEffect } from 'react';

export const Tabs = props => {
  const { tabData, activeTab = 0, className = '' } = props;
  const [activeTabNumber, setActiveTabNumber] = useState(0);
  const [active, setActive] = useState(tabData[activeTabNumber] || tabData[0]);

  const changeTabView = key => () => {
    setActive(tabData[key]);

    setActiveTabNumber(key);

    if (props.callback) {
      props.callback(key);
    }
  };

  const getTabClassName = tab => (tab === active ? 'selected' : '');

  const showActiveTabContainer = tab =>
    tab === active ? 'active-tab-container' : '';

  // Listen for Tab changes and set the Active Tab.
  useEffect(() => {
    setActive(tabData[activeTabNumber] || tabData[0]);
  }, [activeTabNumber, tabData]);

  useEffect(() => {
    setActive(tabData[activeTab]);

    setActiveTabNumber(activeTab);
  }, [activeTab, tabData]);

  return (
    <div className={`Tabs ${className}`}>
      <ul className="Tabs-menu">
        {tabData.map((tab: any, key: number) => {
          return (
            <li
              role="menuitem"
              key={key}
              onClick={changeTabView(key)}
              className={`Tabs-menu-item ${getTabClassName(tab)}`}
            >
              {tab.label}
            </li>
          );
        })}
      </ul>
      <div className="Tabs-body">
        {tabData.map((tab: any, key: number) => {
          return (
            <div
              className={`Tabs-body-container ${showActiveTabContainer(tab)}`}
              key={key}
            >
              {tab.component}
            </div>
          );
        })}
      </div>
    </div>
  );
};
