const toggleInArray = (array, item, checkbox) => {
        const esNuevo = !array.includes(item);

        let newArray = [];

        // Se marcó el checkbox de proyecto
        if(checkbox !== null) {
            newArray = checkbox
                ? esNuevo ? [...array, item] : array 
                : array.filter((i) => i !== item); 

            return deleteDuplicateObjects(newArray);
        }

        newArray=  !esNuevo ? array.filter((i) => i !== item) 
            : [...array, item] 

        return deleteDuplicateObjects(newArray);
    
};


const deleteDuplicateObjects = (array) => {
    return array.filter(
        (item, index, self) =>
            index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(item))
    );
}
 
export { toggleInArray };