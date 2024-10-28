import React from "react";
import Button from "./button";
import Modal from "./modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const AddAsset = ({
  onAddAsset,
  categories,
  locations,
  isModalOpen,
  onCloseModal,
  onOpenModal,
}) => {
  return (
    <>
      <Button
        onClick={onOpenModal}
        className="px-3 py-2 text-black bg-[#FEC00D] border-[#FEC00F] rounded-md hover:bg-[#ffd24c] duration-300"
      >
        <FontAwesomeIcon icon={faPlus} className="text-black" />
        <span className="text-black">New Asset</span>
      </Button>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={onCloseModal}
          onAddAsset={onAddAsset}
          categories={categories}
          locations={locations}
        />
      )}
    </>
  );
};

export default AddAsset;
