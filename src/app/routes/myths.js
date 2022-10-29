const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Myth = require('../models/Myth')
//@desc show add page
//@route GET /myths/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('myths/add')
})
//@desc process add form
//@route POST /myths
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Myth.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('error/500')
        
    }
})
//@desc show all myths
//@route GET /myths/add
router.get('/', ensureAuth, async (req, res) => {
    try {
        const myths = await Myth.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('myths/index', {
            myths,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


// @desc    Show single myth
// @route   GET /myths/:id
router.get('/:id', ensureAuth, async (req, res) => {
    try {
      let myth = await Myth.findById(req.params.id).populate('user').lean()
  
      if (!myth) {
        return res.render('error/404')
      }
  
      if (myth.user._id != req.user.id && myth.status == 'private') {
        res.render('error/404')
      } else {
        res.render('myths/show', {
          myth,
        })
      }
    } catch (err) {
      console.error(err)
      res.render('error/404')
    }
  })

//@desc show edit page
//@route GET /myths/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const myth = await Myth.findOne({
            _id: req.params.id,
        }).lean()
        if (!myth) {
            return res.render('error/404')
        }
    
        if (myth.user != req.user.id) {
            res.redirect('/myths')
        } else{
            res.render('myths/edit', {
                myth,
            })
        }
    } catch (error) {
        console.error(err)
        return res.render('error/500') 
    }
    
})
//@desc update myth
//@route PUT /myths/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let myth = await Myth.findById(req.params.id).lean()
        if(!myth){
            return res.render('error/404')
        }
            if (myth.user != req.user.id) {
                res.redirect('/myths')
            } else{
                    myth = await Myth.findByIdAndUpdate({ _id: req.params.id }, req.body, {
                        new: true,
                        runValidators: true,
                    })
                    res.redirect('/dashboard')
                }
    } catch (error) {
        console.error(err)
        return res.render('error/500')   
    }
   
})

//@desc Delete myth
//@route DELETE /myths/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Myth.remove({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

// @desc    User myths
// @route   GET /myths/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
      const myths = await Myth.find({
        user: req.params.userId,
        status: 'public',
      })
        .populate('user')
        .lean()
  
      res.render('myths/index', {
        myths,
      })
    } catch (err) {
      console.error(err)
      res.render('error/500')
    }
  })
module.exports = router