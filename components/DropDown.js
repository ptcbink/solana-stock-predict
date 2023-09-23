import Asset from "./Asset";

//Icons
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { BsPlusLg } from "react-icons/bs";
//Dependencies
import { useState, useContext, useEffect } from "react";
import { STOCKDATA, CRYPTODATA } from "../data/asset.seed";
//Styles
const styles = {
  rightMainItem:
    "flex items-center text-white p-5 border-b border-[#30363b] cursor-pointer",
  ItemTitle: "flex-1 font-bold",
  moreOptions: "cursor-pointer text-xl",
};

const DropDown = ({
  data,
  setData,
  showDropDown,
  setShowDropDown,
  title,
}) => {
  return (
    <>
      <div
        className={styles.rightMainItem}
        onClick={() => {
          setShowDropDown && setShowDropDown(!showDropDown);
        }}
      >
        <div className={styles.ItemTitle}>{title}</div>
        {showDropDown ? (
          <BiDotsHorizontalRounded className={styles.moreOptions} />
        ) : (
          <BsPlusLg />
        )}
      </div>
      {showDropDown &&
        data &&
        data.map((coin, index) => {
          return (
            <Asset
              key={index}
              coin={coin}
              price={coin.price}
              setData={setData}
            />
          );
        })}
    </>
  );
}

export default DropDown