import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useGlobalState } from "../hooks";
import { getSolAmount } from "../utils";
const styles = {
  formButtons: "flex flex-row justify-between px-2",
  button:
    "rounded-lg py-2 px-5 text-[#ffffff] text-xs border-[#30363b] bg-[#1E2123] border ",
  inputForm: "flex flex-row mt-4 justify-center items-center",
  input:
    "rounded-lg px-5 border-[#30363b] bg-[#1E2123] border mx-2  p-1 text-[#ffffff] focus:outline-none",
};
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#1E2123",
  },
};
const CustomModal = ({
  isOpen,
  selectedBet,
  setAvailableStock,
  setShowModal,
}) => {
  const [high, setHigh] = useState(selectedBet.high);
  const [p2Guess, setP2Guess] = useState(0);
  const [low, setLow] = useState(selectedBet.low);


  // Static 
  const staticEnterbet = () => {
    console.log("Closing bet")
  }


  const onClose = () => {
    setHigh(selectedBet.high)
    setLow(selectedBet.low)
    setShowModal(false)
  }


  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={true}
      style={customStyles}
    >
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-[#ffffff] text-2xl">{selectedBet.stockName}</h1>
        <p className="text-[#ffffff]">Length of Bet: 2 minutes {selectedBet.timeType}</p>
        <p className="text-[#ffffff]">Stock price: $4.9</p>
        <p className="text-[#ffffff]">Entrance fee: {selectedBet ? getSolAmount(selectedBet.amount) : new BigNum} SOL</p>
      </div>

      <div className={styles.formButtons}>
        <div
          className={`${styles.button}${high && " bg-[#00ff1a]"}`}
          onClick={() => {
            setHigh(!high);
            setLow(false);
          }}
        >
          HIGH
        </div>
        <div
          className={`${styles.button}${low && " bg-[#ef4b09]"}`}
          onClick={() => {
            setLow(!low);
            setHigh(false);
          }}
        >
          LOW
        </div>
      </div>
      <form className="self-center flex flex-col justify-center items-center">
        <div className={styles.inputForm}>
          <p className="text-[#ffffff]">Price Prediction:</p>
          <input
            className={styles.input}
            placeholder={"GUESS PRICE"}
            type="number"
            required
            onChange={(e) => {
              setP2Guess(e.target.value);
            }}
            value={p2Guess}
          />
        </div>
        <div className="flex flex-row justify-between w-full px-2"> <input
          type="submit"
          value="Submit"
          className={`${styles.button
            }${" bg-[#5cdb5c] w-1/2 text-center mt-8 self-center px-2"}`}
          onClick={(e) => {
            e.preventDefault()
            staticEnterBet(Number(p2Guess), selectedBet)
          }}
        /> <input
            type="submit"
            value="Cancel"
            className={`${styles.button
              }${" bg-[#ef4b09] w-1/2 text-center mt-8 self-center px-2"}`}
            onClick={onClose}
          /></div>

      </form>
    </Modal>
  );
}

export default CustomModal