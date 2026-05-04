import { prisma } from "../prisma-client";
import { Request, Response } from "express";
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
