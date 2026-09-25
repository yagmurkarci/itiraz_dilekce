const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllEndpoints = async () => {
  try {
    const endpoints = await prisma.endpoint.findMany();
    return endpoints;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.createEndpoint = async (routerPath, endpointPath, method, description) => {
  try {
    // Aynı endpointPath ve method kombinasyonu daha önce eklenmiş mi kontrol et
    const existingEndpoint = await prisma.endpoint.findFirst({
      where: {
        endpointPath,
        method
      }
    });

    if (existingEndpoint) {
      throw new Error('Endpoint with this path and method already exists');
    }

    // Yeni endpoint oluştur
    const newEndpoint = await prisma.endpoint.create({
      data: {
        routerPath,
        endpointPath,
        method,
        description
      }
    });

    return { message: 'Endpoint created successfully', endpoint: newEndpoint };
  } catch (error) {
    throw new Error('Error creating endpoint: ' + error.message);
  }
};

exports.updateEndpoint = async (id, routerPath, endpointPath, method, description) => {
  try {
    // Güncellenecek endpoint var mı kontrol et
    const existingEndpoint = await prisma.endpoint.findFirst({
      where: {
        endpointPath,
        method,
        NOT: { id: parseInt(id) }
      }
    });

    if (existingEndpoint) {
      throw new Error('Endpoint with this path and method already exists');
    }

    // Endpoint güncelle
    const updatedEndpoint = await prisma.endpoint.update({
      where: {
        id: parseInt(id)
      },
      data: {
        routerPath,
        endpointPath,
        method,
        description
      }
    });

    return { message: 'Endpoint updated successfully', endpoint: updatedEndpoint };
  } catch (error) {
    throw new Error('Error updating endpoint: ' + error.message);
  }
};

exports.deleteEndpoint = async (id) => {
  try {
    // Silinecek endpoint var mı kontrol et
    const endpointToDelete = await prisma.endpoint.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!endpointToDelete) {
      throw new Error('Endpoint not found');
    }

    // Endpoint sil
    const deletedEndpoint = await prisma.endpoint.delete({
      where: {
        id: parseInt(id)
      }
    });

    return { message: 'Endpoint deleted successfully', endpoint: deletedEndpoint };
  } catch (error) {
    throw new Error('Error deleting endpoint: ' + error.message);
  }
};
