import Apartment from '../models/Apartment.js';
import DateBlock from '../models/DateBlock.js';

const findBlockConflict = async (apartmentId, startDate, endDate) =>
  DateBlock.findOne({
    apartment: apartmentId,
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  });

export const getBlocks = async (req, res, next) => {
  try {
    const blocks = await DateBlock.find()
      .populate('apartment')
      .sort({ startDate: -1 });

    res.json(blocks);
  } catch (error) {
    next(error);
  }
};

export const createBlock = async (req, res, next) => {
  try {
    const { apartment, startDate, endDate, note } = req.body;

    if (!apartment || !startDate || !endDate) {
      const error = new Error('Apartamento, fecha inicio y fecha fin son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    const apartmentDoc = await Apartment.findById(apartment);

    if (!apartmentDoc) {
      const error = new Error('Apartamento no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
      const error = new Error('Las fechas no son validas');
      error.statusCode = 400;
      throw error;
    }

    if (parsedStartDate >= parsedEndDate) {
      const error = new Error('La fecha de fin debe ser posterior a la de inicio');
      error.statusCode = 400;
      throw error;
    }

    const conflict = await findBlockConflict(apartment, parsedStartDate, parsedEndDate);

    if (conflict) {
      const error = new Error('Ya existe un bloqueo manual en ese rango');
      error.statusCode = 409;
      throw error;
    }

    const block = await DateBlock.create({
      apartment,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      note: note || '',
    });

    const populatedBlock = await block.populate('apartment');
    res.status(201).json(populatedBlock);
  } catch (error) {
    next(error);
  }
};

export const deleteBlock = async (req, res, next) => {
  try {
    const block = await DateBlock.findById(req.params.id);

    if (!block) {
      const error = new Error('Bloqueo no encontrado');
      error.statusCode = 404;
      throw error;
    }

    await block.deleteOne();
    res.json({ message: 'Bloqueo eliminado' });
  } catch (error) {
    next(error);
  }
};
