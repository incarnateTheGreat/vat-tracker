import React, { createRef, useCallback, useEffect, useState } from "react";

export const Autocomplete = (props) => {
  const {
    callback,
    minQueryLength = 2,
    onSelect,
    placeholder = "Search",
    searchCompareValue = "",
    selectionData = [],
    usesService = false,
  } = props;

  const [items, setItems] = useState(selectionData);
  const [selectedValue, setSelectedValue] = useState("");
  const [sortedResult, setSortedResult] = useState<object[]>([]);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = createRef<any>();
  const resultRef = createRef<any>();

  const getValue = (name, obj) => {
    if (obj) {
      const arr = name.split(".");
      let result = obj;

      while (arr.length) {
        result = result[arr.shift()];
      }

      return result;
    }
  };

  const handleSearch = useCallback(
    async (query) => {
      let sortedResultLocal = [];

      // Set the Loading Icon for referencing data via a Service.
      if (query.length >= minQueryLength && usesService) {
        setLoading(true);
      }

      // If the Items' children are objects, then filter and map out results. Otherwise, treat the Items as a one-dimensional Array.
      if (Object.keys(items).length > 0 && query.length >= minQueryLength) {
        if (typeof items[0] === "object") {
          sortedResultLocal = items
            .filter((item: object) => {
              const regex = new RegExp(query, "gi");

              return getValue(searchCompareValue, item).match(regex);
            })
            .map((obj) => getValue(searchCompareValue, obj));
        } else {
          sortedResultLocal = items.filter((item: string) => {
            const regex = new RegExp(query, "gi");

            return item.match(regex);
          });
        }
      }

      // Toggle the "No Results" display if the search yields no results.
      sortedResultLocal.length === 0 && query.length >= minQueryLength
        ? setNoResults(true)
        : setNoResults(false);

      setSortedResult(sortedResultLocal);
    },
    [items, minQueryLength, searchCompareValue, usesService]
  );

  // Navigate through results using Up/Down Keys.
  const navigateItems = (e) => {
    if (
      sortedResult.length > 0 &&
      (e.key === "ArrowUp" || e.key === "ArrowDown")
    ) {
      const listElemsLength = resultRef.current.children.length;
      const listElem = resultRef.current.children;

      const selectedElement: HTMLElement | any = document.activeElement;

      switch (e.key) {
        case "ArrowUp":
          listElem[
            checkBoundary(listElemsLength, selectedElement.tabIndex - 1)
          ].focus();
          break;
        case "ArrowDown":
          listElem[
            checkBoundary(listElemsLength, selectedElement.tabIndex + 1)
          ].focus();
          break;
        default:
          break;
      }
    } else if (e.key === "Enter") {
      selectItem(e);
    }
  };

  const sortItems = (e) => {
    const query = inputRef.current.value.toUpperCase();

    // When hitting the 'Enter' key, this will push whatever input there is into the list.
    if (e.key === "Enter" && query.length > 0) {
      selectItem(query, true);

      return;
    }

    // Set first result of list elements as focused to allow for arrow key navigation.
    if (
      sortedResult.length > 0 &&
      (e.key === "ArrowUp" || e.key === "ArrowDown")
    ) {
      const selectedElement: HTMLElement | any = document.activeElement;

      if (!selectedElement.className) {
        resultRef.current.children[0].focus();
      }

      return;
    }
  };

  const selectItem = (e, isTextInput?) => {
    let textInput = null;

    if (isTextInput) {
      textInput = e;
    } else {
      inputRef.current.value = e.target.innerHTML;
      textInput = e.target.innerHTML;
    }

    onSelect(textInput);
  };

  const checkBoundary = (listElemsLength, index) => {
    let indexVal = index;

    if (index === listElemsLength) {
      indexVal = index - 1;
    } else if (index < 0) {
      indexVal = index + 1;
    }

    return indexVal;
  };

  // Set/Update the Autocomplete data.
  useEffect(() => {
    setItems(selectionData);

    if (usesService) {
      setLoading(false);
    }
  }, [selectionData, usesService]);

  return (
    <div className="autocomplete">
      <input
        onChange={(event) => {
          setSelectedValue(event.target.value.toUpperCase());
          handleSearch(event.target.value.toUpperCase());

          if (callback) {
            callback(event.target.value.toUpperCase());
          }
        }}
        onKeyUp={sortItems}
        placeholder={placeholder}
        ref={inputRef}
        type="text"
        value={selectedValue}
      />
      {loading ? (
        <span className="lds-dual-ring"></span>
      ) : (
        sortedResult && (
          <div className="autocomplete-results" ref={resultRef}>
            {sortedResult.length > 0 &&
              sortedResult.map((item, i) => (
                <span
                  role="presentation"
                  className="autocomplete-result"
                  onKeyUp={navigateItems}
                  onClick={() => onSelect(item)}
                  key={i}
                  tabIndex={i}
                >
                  {item}
                </span>
              ))}
            {noResults && (
              <span className="autocomplete-result --no-results">
                Sorry. There are no results based on your search.
              </span>
            )}
          </div>
        )
      )}
    </div>
  );
};
