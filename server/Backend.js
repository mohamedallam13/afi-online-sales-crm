(function (root, factory) {
    root.AFI_ONLINE_ORDERS = factory();
})(this, function () {
    const { MASTER_INDEX_ID } = ENV
    const { Toolkit } = AFILibrary
    const { readFromJSON, writeToJSON, timestampCreate, groupBy } = Toolkit

    // function getStartupData() {
    //     const masterFile = readFromJSON(MASTER_INDEX_ID)
    //     const { productsList, unitsForOrdersForm, areasFormulatedFile, counters } = masterFile
    //     const districtsList = readFromJSON(areasFormulatedFile)
    //     console.log("Districts Loaded")
    //     const productsArray = readFromJSON(productsList)
    //     console.log("Products Loaded")
    //     const unitsArray = readFromJSON(unitsForOrdersForm)
    //     console.log("Units Loaded")
    //     const countersFile = readFromJSON(counters)
    //     console.log("Counters Loaded")
    //     const { cutomersOrdersCounter } = countersFile
    //     return { districtsList, productsArray, unitsArray, cutomersOrdersCounter }
    // }

    function getStartupData() {
        const masterFile = readFromJSON(MASTER_INDEX_ID)
        const {  areasFormulatedFile, counters, unitsForOrdersForm } = masterFile
        const districtsObject = readFromJSON(areasFormulatedFile)
        console.log("Districts object loaded")

        // Transform the object of arrays into a single flat array
        const districtsList = Object.values(districtsObject).flat();

        const countersFile = readFromJSON(counters)
        console.log("Counters Loaded")
        const cutomersOrdersCounter = countersFile.cutomersOrdersCounter || 0

        const unitsList = readFromJSON(unitsForOrdersForm) || []
        console.log("Units Loaded")

        return JSON.stringify({ districtsList, cutomersOrdersCounter, unitsList })
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
        console.log("buffered:",request)
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

            // Attach timestamp, reference, and status
            request.timestamp = timestamp;
            request.reference = reference;
            request.status = 'pending';
            request.error = null;
            pendingRequests.push(request);
            writeToJSON(cormCompoundedRequestsBuffer, pendingRequests);

            return JSON.stringify({
                success: true,
                message: `Request ${reference} added to buffer successfully`,
                reference: reference
            });
        } catch (error) {
            console.error('Error adding compounded request to buffer:', error);
            return JSON.stringify({
                success: false,
                message: `Error adding compounded request to buffer: ${error.message}`,
                stack: error.stack
            });
        }
    }

    function OrderRequest(order) {
        this.customer_order_serial = order.orderSerial || order.customer_order_serial || '';
        this.customer_original_serial = order.customer_original_serial || '';
        this.version_number = order.version_number || '1';
        this.change_type = order.change_type || 'New Order';
        this.status = order.status || 'Pending';
        this.sales_person_id = order.sales_person_id || '600000000000001';
        this.payment_type = order.payment_type || 'cash';
        this.customer_id = order.customer_id || order.customerId || '';
        this.address_id = order.address_id || order.addressId || '';
        this.customer_order_comment = order.notes || order.customer_order_comment || '';
        this.customer_order_date = order.customer_order_date || timestampCreate(new Date(), "M/d/YYYY HH:mm:ss");
        this.customer_order_deadline = order.deadline || order.customer_order_deadline || '';
        this.changed_at = order.changed_at || timestampCreate(new Date(), "M/d/YYYY HH:mm:ss");
        this.change_reason = order.change_reason || 'Initial entry';
        this.order_url = order.order_url || '';
        this.order_invoice_number = order.order_invoice_number || '';
        this.order_invoice_value = order.totalAmount || order.order_invoice_value || 0;
        
        // Discount and Amount Fields
        this.amount = order.totalAmount || order.amount || 0;
        const discountType = order.discountType || 'amount'; // Default to 'amount' for legacy
        const discountValue = order.discountValue !== undefined ? order.discountValue : (order.discount || 0);
        
        let calculatedDiscount = 0;
        if (discountType === 'percentage') {
            calculatedDiscount = (this.amount * discountValue) / 100;
        } else {
            calculatedDiscount = discountValue;
        }

        this.discount_type = discountType;
        this.discount_value = discountValue; // The raw value (e.g., 15 for 15% or 50 for 50 EGP)
        this.discount = calculatedDiscount; // The final monetary value of the discount
        this.discount_reason = order.discountReason || order.discount_reason || '';
        this.net_amount = this.amount - calculatedDiscount;

        this.primary_source_of_sale = order.source || order.primary_source_of_sale || '';
        this.secondary_source_of_sale = order.secondarySource || order.secondary_source_of_sale || '';
        this.items = (order.items || []).map(item => ({
            productData: item.productData || {
                product_id: item.productId || item.product_id || '',
                product_name_ar: item.productName || item.product_name_ar || '',
                product_price: item.price || item.product_price || 0
            },
            quantity: item.quantity,
            unit: item.unitData || {
                unit_id: item.unitId || item.unit_id || '',
                unit_name_ar: item.unitName || item.unit_name_ar || item.unit || '',
                unit_name: item.unitName || item.unit_name || ''
            },
            item_comment: item.comments || item.item_comment || ''
        }));
    }

    function AddressRequest(address) {
        this.address_label = address.address_label || '';
        this.address_type = address.address_type || '';
        this.address_comment = address.address_comment || '';
        this.house_number = address.house_number || '';
        this.flat_number = address.flat_number || '';
        this.floor_number = address.floor_number || '';
        this.street_name = address.street_name || '';
        this.address_marking = address.address_marking || '';
        this.address_district = address.address_district || '';
        this.address_governorate = address.address_governorate || '';
        this.area_id = address.area_id || '';
        this.isPrimary = address.isPrimary || '';
    }

    function CustomerRequest(customer) {
        this.customer_name = customer.name || '';
        this.customer_gender = customer.gender || '';
        this.customer_type = customer.type || '';
        this.customer_comment = customer.comment || '';
        this.primary_source_of_sale = customer.primary_source_of_sale || '';
        this.secondary_source_of_sale = customer.secondary_source_of_sale || '';
        this.customer_phone = customer.phone || '';
        this.customer_whatsapp = customer.whatsapp || '';
        this.customer_email = customer.email || '';
    }

    function addCompoudedOrder(request) {
        const orderRequest = new OrderRequest(request);
        console.log('Processing compounded request:', orderRequest);
        // Create new customer if provided
        let customerId = orderRequest.customer_id;
        if (!request.customer_id) {
            const customerRequest = new CustomerRequest(request.customer);
            customerId = createNewCustomer(customerRequest);
        }
        // Create new address if provided
        let addressId = orderRequest.address_id;
        if (!request.address_id) {
            const addressRequest = new AddressRequest(request.address);
            addressId = createNewAddress(addressRequest);
        }
        // Set the customer and address IDs in the orderRequest
        orderRequest.customer_id = customerId;
        orderRequest.address_id = addressId;
        // Pass orderRequest directly to createNewOrder
        const { pdfUrl, customerOrderId } = createNewOrder(orderRequest);
        // Remove from buffer if successful
        if (customerOrderId && request.reference) {
            removeCompoundedRequestFromBuffer(request.reference);
            increaseOrderCounter();
        }
        // return { pdfUrl, customerOrderId };
        return { pdfUrl, customerOrderId };
    }

    function addCustomer(customerData) {
        console.log(customerData)
        const { customer, address } = customerData
        const customerId = createNewCustomer(customer)
        if(address) {
            const addressId = createNewAddress(address)
            customer.address_id = addressId
            return JSON.stringify({address_id: addressId, customer_id: customerId});
        }
        return JSON.stringify({customer_id: customerId});
    }
    
    function createNewCustomer(customer) {
        const customerRequest = new CustomerRequest(customer);
        console.log(customerRequest)
        const customerId = AFIDBSheetsController.runRequest("createNewCustomer", customerRequest)[0];
        return customerId;
    }

    function addAddress(address) {
        const addressId = createNewAddress(address)
        return JSON.stringify({id: addressId});
    }

    function createNewAddress(address) {
        const addressRequest = new AddressRequest(address);
        console.log(addressRequest)
        const addressId = AFIDBSheetsController.runRequest("createNewAddress", addressRequest)[0];
        return addressId;
    }

    function createNewOrder(formData) {
        const { pdfUrl, blob } = generateOrderPDF(formData)
        const customerOrderId = saveOrderToDBSheet(formData)
        // sendEmail(blob, formData)
        console.log(formData)
        SpreadsheetApp.flush()
        return { pdfUrl, customerOrderId }
    }

    function addNewLead(formData) {
        const leadId = createNewLead(formData)
        return JSON.stringify({id: leadId})
    }

    function createNewLead(formData) {
        const leadId = AFIDBSheetsController.runRequest("createNewLead", formData)
        return leadId
    }

    function saveOrderToDBSheet(formData) {
        // augmentNewParameters(formData)
        return AFIDBSheetsController.runRequest("createNewCustomerOrder", formData)
    }

    // function augmentNewParameters(formData) {
    //     // Combine the date and time into a single string
    //     const dateTimeString = `${formData.orderDate}T${formData.orderTime}`;
    //     // Create a Date object
    //     const dateObj = new Date(dateTimeString);
    //     formData.order_date = timestampCreate(dateObj, "M/d/YYYY HH:mm:ss")
    //     formData.changed_at = timestampCreate(dateObj, "M/d/YYYY HH:mm:ss")
    // }

    function increaseOrderCounter() {
        const masterFile = readFromJSON(MASTER_INDEX_ID)
        const { counters } = masterFile
        const countersFile = readFromJSON(counters)
        console.log(countersFile)
        countersFile.cutomersOrdersCounter = countersFile.cutomersOrdersCounter + 1
        writeToJSON(counters, countersFile)
    }

    function removeCompoundedRequestFromBuffer(reference) {
        const masterFile = readFromJSON(MASTER_INDEX_ID);
        const { cormCompoundedRequestsBuffer } = masterFile;
        let pendingRequests = readFromJSON(cormCompoundedRequestsBuffer);
        pendingRequests = pendingRequests.filter(req =>
            (req.reference || (req.order && req.order.reference)) !== reference
        );
        writeToJSON(cormCompoundedRequestsBuffer, pendingRequests);
        return true;
    }

    function generateOrderPDF(formData) {
        // const pdfUrl = AFIDBSheetsController.runRequest("generateOrderPDF", formData)
        return { pdfUrl: 'https://www.google.com', blob: 'blob' }
    }

    return {
        getStartupData,
        getCustomersData,
        getLeadsData,
        addCompoundedRequestToBuffer,
        addCustomer,
        addAddress,
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

function addCustomer(customerData) {
    return AFI_ONLINE_ORDERS.addCustomer(customerData)
}

function addLead(lead) {
    return AFI_ONLINE_ORDERS.addLead(lead)
}

function addAddress(address) {
    return AFI_ONLINE_ORDERS.addAddress(address)
}

function addCompoundedRequestToBuffer(order) {
    return AFI_ONLINE_ORDERS.addCompoundedRequestToBuffer(order)
}

function addCompoudedOrder(order) {
    console.log(order);
    return AFI_ONLINE_ORDERS.addCompoudedOrder(order)
}