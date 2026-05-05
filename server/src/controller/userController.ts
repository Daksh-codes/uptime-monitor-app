import { prisma } from "../prisma-client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import * as bcrypt from "bcrypt";

const getUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // validate id
    if (!id) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // fetch user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // handle no user
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {}
};

const addUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // checking for exsiting user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // password hashing
    const hashedPassword = await bcrypt.hash(password, 12);

    // new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // validate id
    if (!id) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    //delete user
    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({
      message: `User with id ${id} has been deleted`,
    });
  } catch (error: any) {
    
    // prisma generates this error code P2025 when record not found
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatched = await bcrypt.compare(user.password, password);

    if (!passwordMatched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id }, // payload
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );


    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });


  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
