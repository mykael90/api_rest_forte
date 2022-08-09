// import User from '../models/User';

import jwt from 'jsonwebtoken';
import User from '../models/User';

class TokenController {
  async store(req, res) {
    const { username = '', password = '' } = req.body;

    if (!username || !password) {
      return res.status('401').json({
        errors: ['Credenciais inválidas'],
      });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        errors: ['Usuário não existe'],
      });
    }

    if (!(await user.passwordIsValid(password))) {
      return res.status(401).json({
        errors: ['Senha inválida'],
      });
    }

    console.log(JSON.stringify(user));

    console.log(Object.getPrototypeOf(user));

    const role = await user.getUserRoles(); // PAPÉIS LIEBERADOS
    const position = await user.getUserPositions(); // CARGO OCUPADO
    const job = await user.getUserThirds(); // OCUPAÇÃO USUARIO DE TERCEIRIZADA

    const { id, email } = user;

    const token = jwt.sign(
      { id, username, email },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION },
    );

    return res.json({
      token,
      user: {
        name: user.name, id, username, email: user.email, role, position, job,
      },
    });
  }
}

export default new TokenController();
