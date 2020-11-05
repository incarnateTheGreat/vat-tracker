import React, { createRef, useCallback, useEffect, useState } from "react";

interface Item {
  searchCompareValue: string;
  searchReturnValue: string;
}

export const Autocomplete = (props) => {
  const {
    callback,
    minQueryLength = 2,
    onSelect,
    placeholder = "Search",
    searchCompareValue = "",
    searchReturnValue = "",
    selectionData = [],
    usesService = false,
  } = props;

  const [items, setItems] = useState(selectionData);
  const [selectedValue, setSelectedValue] = useState("");
  const [sortedResult, setSortedResult] = useState<Item[]>([]);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = createRef<any>();
  const resultRef = createRef<any>();
  const [delayTimer, setDelayTimer] = useState<any>();

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
    async (query, overrideItemData?) => {
      const itemData = overrideItemData ?? items;

      let sortedResultLocal = [];

      // If the Items' children are objects, then filter and map out results. Otherwise, treat the Items as a one-dimensional Array.
      if (Object.keys(itemData).length > 0 && query.length >= minQueryLength) {
        if (typeof itemData[0] === "object") {
          sortedResultLocal = itemData
            .filter((item: object) => {
              return (
                getValue(searchCompareValue, item)
                  .toLowerCase()
                  .indexOf(query.toLowerCase()) !== -1
              );
            })
            .map((obj) => {
              const compareValue = getValue(searchCompareValue, obj);

              // If there is no specified Search Return Value, then return the Compare Value.
              const returnValue = searchReturnValue
                ? getValue(searchReturnValue, obj)
                : compareValue;

              return {
                searchCompareValue: compareValue,
                searchReturnValue: returnValue,
              };
            });
        } else {
          sortedResultLocal = itemData.filter((item: string) => {
            const regex = new RegExp(query, "gi");

            return item.match(regex);
          });
        }
      }

      // // Toggle the "No Results" display if the search yields no results.
      sortedResultLocal.length === 0 && query.length >= minQueryLength
        ? setNoResults(true)
        : setNoResults(false);

      setSortedResult(sortedResultLocal);
    },
    [items, minQueryLength, searchCompareValue]
  );

  // Navigate through results using Up/Down Keys.
  const navigateItems = (e) => {
    e.preventDefault();

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
        default: {
          break;
        }
      }
    } else if (e.key === "Enter") {
      onSelect(e.target.dataset.item);
    }
  };

  const sortItems = (e) => {
    const query = selectedValue;

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

  const handleCallback = (query) => {
    // Set the Loading Icon for referencing data via a Service.
    if (query.length >= minQueryLength && usesService) {
      setDelayTimer(clearTimeout(delayTimer));

      // In order to allow for a type ahead function, we must asychronously:
      // a) get the result,
      // b) set the Items State variable for the record,
      // c) conduct the search but using the results we just acquired instead of waiting for the State variable to update,
      // d) and then disabling the Loading Spinner.
      const timeout = setTimeout(async () => {
        setLoading(true);

        const res = await callback(query);

        setItems(res);

        await handleSearch(selectedValue, res);

        setLoading(false);
      }, 500);

      setDelayTimer(timeout);
    }
  };

  // Listener that closes the Autocomplete results list when the user clicks away from it.
  const clickListener = useCallback(() => {
    if (sortedResult.length > 0) {
      setSortedResult([]);
      setSelectedValue("");
    }
  }, [sortedResult.length]);

  // Display the searched and non-searched content in the Autocomplete return data.
  const handleInnerHTML = (item) => {
    // In order to search for parenthesis, the string needs to escape the open and close parenthesis characters. If not, the RegExp function will break.
    const selectedValueEscaped = selectedValue
      .replace(/(?=[(])+/gim, "\\")
      .replace(/(?=[)])+/gim, "\\");

    return item.searchCompareValue.replace(
      new RegExp(selectedValueEscaped, "gi"),
      function replace(match) {
        return `<mark>${match}</mark>`;
      }
    );
  };

  // Set/Update the Autocomplete data.
  useEffect(() => {
    setItems(selectionData);
  }, [selectionData]);

  // If the input requires a data render, and the Input is disabled, re-enable it once the Loading Spinner has disabled and the data is ready.
  useEffect(() => {
    if (!loading && usesService && inputRef.current.value.length > 0) {
      inputRef.current.focus();
    }
  }, [inputRef, loading, usesService]);

  // Close the Autocopmlete results list when the user clicks anywhere outside of it.
  useEffect(() => {
    document.addEventListener("click", clickListener);

    // Reset the Popover position to default.
    return () => {
      document.removeEventListener("click", clickListener);
    };
  }, [sortedResult, clickListener]);

  return (
    <div className="autocomplete">
      <input
        onChange={(event) => {
          const query = event.target.value;

          setSelectedValue(query);

          if (callback) {
            handleCallback(query);
          } else {
            handleSearch(query);
          }
        }}
        disabled={loading}
        onKeyUp={sortItems}
        placeholder={placeholder}
        ref={inputRef}
        type="text"
        value={selectedValue}
      />
      {loading ? (
        <span className="lds-dual-ring"></span>
      ) : (
        sortedResult.length > 0 && (
          <div className="autocomplete-results" ref={resultRef}>
            {sortedResult.map((item, i) => {
              return (
                <span
                  role="presentation"
                  className="autocomplete-result"
                  onKeyDown={navigateItems}
                  onClick={() => onSelect(item.searchReturnValue)}
                  key={i}
                  tabIndex={i}
                  data-item={item.searchReturnValue}
                  dangerouslySetInnerHTML={{
                    __html: handleInnerHTML(item),
                  }}
                />
              );
            })}
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
