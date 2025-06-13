(function (root, factory) {
    root.AFI_ONLINE_ORDERS = factory();
})(this, function () {
    const { MASTER_INDEX_ID } = ENV
    const { Toolkit } = AFILibrary
    const { readFromJSON, writeToJSON, timestampCreate, groupBy } = Toolkit

    function getStartupData() {
        const masterFile = readFromJSON(MASTER_INDEX_ID)
        const { productsList, unitsForOrdersForm, areasFormulatedFile, counters } = masterFile
        const districtsList = readFromJSON(areasFormulatedFile)
        console.log("Districts Loaded")
        const productsArray = readFromJSON(productsList)
        console.log("Products Loaded")
        const unitsArray = readFromJSON(unitsForOrdersForm)
        console.log("Units Loaded")
        const countersFile = readFromJSON(counters)
        console.log("Counters Loaded")
        const { cutomersOrdersCounter } = countersFile
        return { districtsList, productsArray, unitsArray, cutomersOrdersCounter }
    }

    function getCustomersData() {
        const masterFile = readFromJSON(MASTER_INDEX_ID)
        const { customerFormulatedFile } = masterFile
        return { customerFormulatedFile }
    }

    function getLeadsData() {
        const masterFile = readFromJSON(MASTER_INDEX_ID)
        const { leadsFormulatedFile } = masterFile
        return { leadsFormulatedFile }
    }

    function addCompoundedRequestToBuffer(request) {
        try {
            const timestamp = timestampCreate(undefined, "M/d/YYYY HH:mm:ss");
            const masterFile = readFromJSON(MASTER_INDEX_ID);
            const { cormCompoundedRequestsBuffer } = masterFile;
            const pendingRequests = readFromJSON(cormCompoundedRequestsBuffer);

            // Use a unique reference for compounded requests (order reference or generated)
            const reference = request.reference || (request.order && request.order.reference) || `REQ-${Date.now()}`;
            const existingIndex = pendingRequests.findIndex(
                req => (req.reference || (req.order && req.order.reference)) === reference
            );

            if (existingIndex !== -1) {
                console.log(`Request with reference ${reference} already exists in buffer`);
                return JSON.stringify({
                    success: false,
                    message: `Request with reference ${reference} already exists in buffer`,
                    existingRequest: pendingRequests[existingIndex]
                });
            }

            // Attach timestamp and reference
            request.timestamp = timestamp;
            request.reference = reference;
            pendingRequests.push(request);
            writeToJSON(cormCompoundedRequestsBuffer, pendingRequests);

            // Fire and forget background processing
            processCompoundedRequestInBackground(request);

            return JSON.stringify({
                success: true,
                message: `Request ${reference} added to buffer successfully`
            });
        } catch (error) {
            return JSON.stringify({
                success: false,
                message: `Error adding compounded request to buffer: ${error.message}`
            });
        }
    }

    function addCompoudedOrder(request) {
        console.log('Processing compounded request:', request);
        
        // Create new customer if provided
        let customerId = request.customer_id;
        if (request.customer) {
            customerId = createNewCustomer(request.customer);
        }

        // Create new address if provided
        let addressId = request.address_id;
        if (request.address) {
            addressId = createNewAddress(request.address);
        }

        // Create the order with all information
        const orderData = {
            customer_id: customerId,
            address_id: addressId,
            items: request.items,
            notes: request.notes,
            source: request.source,
            secondary_source: request.secondarySource
        };

        const orderId = createNewOrder(orderData);
        return orderId;
    }

    function createNewCustomer(customer) {
        const customerId = AFIDBSheetsController.runRequest("createNewCustomer", customer)
        return customerId
    }

    function createNewAddress(address) {
        const addressId = AFIDBSheetsController.runRequest("createNewAddress", address)
        return addressId
    }

    function createNewOrder(formData) {
        const { pdfUrl, blob } = generateOrderPDF(formData)
        const customerOrderId = saveOrderToDBSheet(formData)
        // sendEmail(blob, formData)
        increaseOrderCounter()
        console.log(formData)
        SpreadsheetApp.flush()
        return pdfUrl
    }

    function addNewLead(formData) {
        const leadId = createNewLead(formData)
        return leadId
    }

    function createNewLead(formData) {
        const leadId = AFIDBSheetsController.runRequest("createNewLead", formData)
        return leadId
    }

    function saveOrderToDBSheet(formData) {
        augmentNewParameters(formData)
        return AFIDBSheetsController.runRequest("createNewCustomerOrder", order)
    }

    function augmentNewParameters(formData) {
        // Combine the date and time into a single string
        const dateTimeString = `${formData.orderDate}T${formData.orderTime}`;
        // Create a Date object
        const dateObj = new Date(dateTimeString);
        formData.order_date = timestampCreate(dateObj, "M/d/YYYY HH:mm:ss")
        formData.changed_at = timestampCreate(dateObj, "M/d/YYYY HH:mm:ss")
    }

    function increaseOrderCounter() {
        const masterFile = readFromJSON(MASTER_INDEX_ID)
        const { counters } = masterFile
        const countersFile = readFromJSON(counters)
        console.log(countersFile)
        countersFile.cutomersOrdersCounter = countersFile.cutomersOrdersCounter + 1
        writeToJSON(counters, countersFile)
    }

    // Placeholder for background processing
    function processCompoundedRequestInBackground(request) {
        // This should be implemented to process the request and add to DB asynchronously
        // For now, just log
        console.log('Processing compounded request in background:', request);
        // Example: setTimeout(() => addCompoudedOrder(request), 0);
    }

    return {
        getStartupData,
        getCustomersData,
        getLeadsData,
        addCompoundedRequestToBuffer,
        // addCustomer,
        addCompoudedOrder,
        // updateCustomer,
        // updateOrder,
        addNewLead,
        // deleteCustomer,
        // deleteOrder
    }
})

function getStartupData() {
    return AFI_ONLINE_ORDERS.getStartupData()
}

function getCustomersData() {
    return AFI_ONLINE_ORDERS.getCustomersData()
}

function getCustomersData() {
    return AFI_ONLINE_ORDERS.getCustomersData()
}

function addCompoundedRequestToBuffer(order) {
    return AFI_ONLINE_ORDERS.addCompoundedRequestToBuffer(order)
}

function addCompoudedOrder(order) {
    console.log(order);
    return AFI_ONLINE_ORDERS.addCompoudedOrder(order)
}